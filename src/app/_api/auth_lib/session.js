import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import moment from "moment";
import { url } from "../routes";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session) {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });

    const userEndpoint = `${url()}/user/profile`;

    try {
      const userProfile = await fetch(userEndpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${payload.accessToken}`,
        },
      });

      // console.log("userprofile", userProfile.status)

      if (userProfile.status === 401) {
        return {
          status: false,
          payload: payload,
        };
      }
    } catch (e) {
      // console.log('Failed to fetch user profile')
      return {
        status: false,
        payload: payload,
      };
    }

    return {
      status: true,
      payload: payload,
    };
  } catch (error) {
    // console.log('Failed to verify session')
    return {
      status: false,
      payload: {},
    };
  }
}

export async function createSession(accessToken, user, req) {
  const session = await encrypt({
    accessToken,
    userId: user.id, // add userId here
  });

  const isHttps =
    req?.headers["x-forwarded-proto"] === "https" || req?.protocol === "https";

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
  });

  (await cookies()).set("user", JSON.stringify(user), {
    secure: isHttps,
    sameSite: "lax",
    path: "/",
  });
}


export async function updateSession() {
  const session = (await cookies()).get("session").value;
  const payload = await decrypt(session);

  const isHttps =
    req?.headers["x-forwarded-proto"] === "https" || req?.protocol === "https";

  if (!session || !payload) {
    return null;
  }

  const expiresAt = new Date(moment(Date.now()).add(1800, "s"));
  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: isHttps,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  (await cookies()).delete("session");
  (await cookies()).delete("user");
}

export async function getToken() {
  const cookie = (await cookies()).get("session")?.value;
  const session = (await decrypt(cookie)).payload;

  return session?.accessToken;
}

export async function getUserId() {
  const cookie = (await cookies()).get("session")?.value;
  const session = (await decrypt(cookie)).payload;
  return session?.userId; // Assumes userId is in the JWT payload
}
