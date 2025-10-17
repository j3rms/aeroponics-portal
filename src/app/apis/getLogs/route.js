// /app/apis/getLogs/route.js

import { NextResponse } from "next/server";
import { getToken, getUserId } from "../../_api/auth_lib/session";
import { url } from "../../_api/routes";

export async function GET(request) {
  try {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
      return NextResponse.json(
        { success: false, message: "Authentication token not found." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const towerId = searchParams.get("towerId");
    const limit = parseInt(searchParams.get("limit") || "100", 10); // default 100

    // First, fetch user's towers
    const towersResponse = await fetch(`${url()}/tower/user/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    });

    if (!towersResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch user towers" },
        { status: towersResponse.status }
      );
    }

    const towersData = await towersResponse.json();
    const userTowerIds = new Set();
    
    if (towersData.status && Array.isArray(towersData.data)) {
      towersData.data.forEach(tower => {
        if (tower.id) userTowerIds.add(tower.id);
      });
    }

    // If user has no towers, return empty array
    if (userTowerIds.size === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Fetch all nutrient logs
    const endpoint = `${url()}/nutrient`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { success: false, message: errText || "Failed to fetch logs" },
        { status: response.status }
      );
    }

    // Be defensive against malformed JSON
    const text = await response.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch (e) {
      return NextResponse.json(
        { success: false, message: "Backend returned invalid JSON" },
        { status: 500 }
      );
    }

    const waterLevelMap = {
      HIGH: 100,
      MEDIUM: 50,
      LOW: 25,
    };

    let items = [];
    if (payload.status && Array.isArray(payload.data)) {
      let logs = payload.data;
      
      // Filter by user's towers only
      logs = logs.filter((log) => {
        const logTowerId = log?.tower?.id;
        return logTowerId && userTowerIds.has(logTowerId);
      });

      // Further filter by specific tower if provided
      if (towerId) {
        const idNum = parseInt(towerId, 10);
        logs = logs.filter((log) => log?.tower?.id === idNum);
      }

      // sort by time if available (now LocalDateTime from backend)
      logs.sort((a, b) => {
        const ta = a?.time ? new Date(a.time).getTime() : 0;
        const tb = b?.time ? new Date(b.time).getTime() : 0;
        return ta - tb;
      });

      // take last N
      const recent = logs.slice(-limit);

      items = recent.map((log, idx) => {
        // Parse LocalDateTime from backend (format: "2025-10-17T10:45:00")
        let timestamp = null;
        let timeOnly = null;
        
        if (log?.time) {
          try {
            // Backend returns LocalDateTime in ISO format
            const dt = new Date(log.time);
            timestamp = dt.toISOString();
            // Extract time portion for display
            timeOnly = dt.toTimeString().split(' ')[0]; // "HH:mm:ss"
          } catch (e) {
            console.error('Failed to parse datetime:', log.time, e);
          }
        }

        return {
          id: log.id ?? idx + 1,
          towerName: log?.tower?.name || "Unknown",
          plantName: log?.tower?.plant?.name || "Unknown",
          phLevel: parseFloat(log?.ph_level ?? 0),
          ppmLevel: parseFloat(log?.ppm ?? 0),
          waterLevel: waterLevelMap[log?.water_level] ?? 0,
          waterTemperature: parseFloat(log?.water_temperature ?? 0),
          time: timeOnly, // Time-only string for display ("HH:mm:ss")
          timestamp: timestamp, // Full ISO timestamp
        };
      });
    }

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { success: false, message: "Server error fetching logs" },
      { status: 500 }
    );
  }
}
