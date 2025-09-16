import "server-only";
import { NextResponse } from "next/server";
import { url, tokenUrl } from "../../_api/routes";
import { api } from "../../_api/api_client";
import { createSession } from "../../_api/auth_lib/session";

export async function POST(req) {
  try {
    const user = await req.json();

    const authUser = user.email;
    const authPass = user.password;

    const basicAuth =
      "Basic " + Buffer.from(`${authUser}:${authPass}`).toString("base64");
    
    const oauthRequest = `${tokenUrl()}/login`;

    const oauthResponse = await fetch(oauthRequest, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: basicAuth,
      },
    });

    // console.log("oauthResponse", oauthResponse.status);

    const headers = oauthResponse.headers;
    const setCookie = headers.getSetCookie();
    const refreshTokenCookie = setCookie.find(cookie => cookie.startsWith('refresh_token='));
    const refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];
    const oauthData = await oauthResponse.json();

    if (!oauthResponse.ok) {
      const errorBody = oauthData;
      const errorMessage = errorBody.error || "Failed to authenticate";

      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: oauthResponse.status }
      );
    }

    const accessToken = oauthData.access_token;

    const userEndpoint = `${url()}/user`;

    const userProfile = await fetch(userEndpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userProfileObj = await userProfile.json();

    const userProfileObjData = userProfileObj.data;

    const userProfileData = {
      id: userProfileObjData.id,
      first_name: userProfileObjData.first_name,
      last_name: userProfileObjData.last_name,
      email: userProfileObjData.email,
      password: userProfileObjData.password,
      refreshToken,
    };

    await createSession(accessToken, userProfileData, req);

    return NextResponse.json(
      { success: true, user: userProfileObj },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error during sign-in:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while signing in.",
      },
      { status: 500 }
    );
  }
}
