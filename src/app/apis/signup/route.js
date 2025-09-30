import "server-only";
import { NextResponse } from "next/server";
import { url, tokenUrl } from "../../_api/routes";
import { api } from "../../_api/api_client";
import { createSession } from "../../_api/auth_lib/session";

export async function POST(req) {
    try {
      // Get body from frontend
      const body = await req.json();
  
      // Forward request to Spring Boot backend
      const response = await fetch("http://localhost:8080/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
  
      // Get response from backend
      const data = await response.json();
  
      // Return response back to frontend
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error in /api/signup route:", error);
  
      return new Response(
        JSON.stringify({ message: "Internal server error", error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
}