import "server-only";
import { NextResponse } from "next/server";
import { url, tokenUrl } from "../../_api/routes";
import { createSession } from "../../_api/auth_lib/session";

export async function POST(request) {
  try {
    const { firstName, lastName, email, password, confirmPassword, otpCode } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !confirmPassword || !otpCode) {
      return NextResponse.json(
        { 
          success: false, 
          message: "All fields are required" 
        },
        { status: 400 }
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Passwords do not match" 
        },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "OTP must be 6 digits" 
        },
        { status: 400 }
      );
    }

    const verifyOtpRegisterEndpoint = `${tokenUrl()}/verify-otp-register`;

    // Call backend API to verify OTP and register user
    const backendResponse = await fetch(verifyOtpRegisterEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otpCode
      }),
    });

    const result = await backendResponse.json();

    if (backendResponse.ok) {
      // Auto-login: Get access token and create session
      try {
        // Login with the new credentials
        const basicAuth = "Basic " + Buffer.from(`${email}:${password}`).toString("base64");
        const loginRequest = `${tokenUrl()}/login`;

        const loginResponse = await fetch(loginRequest, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: basicAuth,
          },
        });

        if (loginResponse.ok) {
          const headers = loginResponse.headers;
          const setCookie = headers.getSetCookie();
          const refreshTokenCookie = setCookie.find(cookie => cookie.startsWith('refresh_token='));
          const refreshToken = refreshTokenCookie?.split(';')[0].split('=')[1];
          const loginData = await loginResponse.json();
          const accessToken = loginData.access_token;

          // Get user profile
          const userEndpoint = `${url()}/user/profile`;
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

          // Create session to log in the user automatically
          await createSession(accessToken, userProfileData, request);

          return NextResponse.json({
            success: true,
            message: result.message || "Account created successfully",
            data: result,
            user: userProfileObj
          });
        } else {
          // Registration succeeded but auto-login failed, user needs to login manually
          return NextResponse.json({
            success: true,
            message: result.message || "Account created successfully. Please login.",
            data: result
          });
        }
      } catch (loginError) {
        console.error("Auto-login failed after registration:", loginError);
        // Registration succeeded but auto-login failed
        return NextResponse.json({
          success: true,
          message: result.message || "Account created successfully. Please login.",
          data: result
        });
      }
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message || "Failed to verify OTP or create account. Please try again." 
        },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error("Error in verify OTP and register API:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error. Please try again later." 
      },
      { status: 500 }
    );
  }
}
