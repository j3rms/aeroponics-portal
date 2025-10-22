// /app/apis/getSensorHistory/route.js

import { NextResponse } from "next/server";
import { getToken, getUserId } from "../../_api/auth_lib/session";
import { url } from "../../_api/routes";

export async function GET(request) {
  try {
    const token = await getToken();
    const userId = await getUserId();

    console.log("History - Token:", token ? "exists" : "missing");
    console.log("History - UserId:", userId);

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication token not found." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const towerId = searchParams.get('towerId');
    const limit = searchParams.get('limit') || 10; // Default to last 10 readings

    // Fetch all nutrient logs
    const nutrientEndpoint = `${url()}/nutrient`;
    console.log("History - Fetching from:", nutrientEndpoint);
    
    const response = await fetch(nutrientEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    console.log("History - Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("History - Backend error:", errorText);
      return NextResponse.json(
        { success: false, message: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    // Try to parse JSON, handle malformed responses
    let data;
    const responseText = await response.text();
    console.log("History - Raw response (first 500 chars):", responseText.substring(0, 500));

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("History - JSON parse error:", parseError.message);
      return NextResponse.json(
        { success: false, message: "Backend returned invalid JSON. This is likely a circular reference issue in your Java entities." },
        { status: 500 }
      );
    }

    console.log("History - Backend data length:", data.data?.length || 0);

    let historyData = {
      labels: [],
      phData: [],
      ppmData: [],
    };
    
    if (data.status && data.data && data.data.length > 0) {
      if (towerId) {
        // Specific tower - filter and get recent data
        const filteredData = data.data.filter(log => log.tower?.id === parseInt(towerId));
        const recentData = filteredData.slice(-limit);
        
        historyData = {
          labels: recentData.map(log => {
            if (log.time) {
              try {
                // Handle LocalDateTime format (e.g., "2025-10-17T10:45:00")
                const dt = new Date(log.time);
                return dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
              } catch {
                return '';
              }
            }
            return '';
          }),
          phData: recentData.map(log => parseFloat(log.ph_level)),
          ppmData: recentData.map(log => parseFloat(log.ppm)),
          waterLevelData: recentData.map(log => parseFloat(log.water_level || 0)),
          temperatureData: recentData.map(log => parseFloat(log.water_temperature || 0))
        };
      } else {
        // All towers - calculate averages for each time point
        // Group logs by time
        const timeGroups = new Map();
        
        data.data.forEach(log => {
          if (log.time) {
            if (!timeGroups.has(log.time)) {
              timeGroups.set(log.time, []);
            }
            timeGroups.get(log.time).push(log);
          }
        });
        
        // Get the last N time points
        const sortedTimes = Array.from(timeGroups.keys()).sort().slice(-limit);
        
        // Calculate averages for each time point
        historyData = {
          labels: sortedTimes.map(time => {
            try {
              // Handle LocalDateTime format
              const dt = new Date(time);
              return dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            } catch {
              return '';
            }
          }),
          phData: sortedTimes.map(time => {
            const logs = timeGroups.get(time);
            const avgPh = logs.reduce((sum, log) => sum + parseFloat(log.ph_level), 0) / logs.length;
            return avgPh;
          }),
          ppmData: sortedTimes.map(time => {
            const logs = timeGroups.get(time);
            const avgPpm = logs.reduce((sum, log) => sum + parseFloat(log.ppm), 0) / logs.length;
            return avgPpm;
          }),
          waterLevelData: sortedTimes.map(time => {
            const logs = timeGroups.get(time);
            const avgWaterLevel = logs.reduce((sum, log) => sum + parseFloat(log.water_level || 0), 0) / logs.length;
            return avgWaterLevel;
          }),
          temperatureData: sortedTimes.map(time => {
            const logs = timeGroups.get(time);
            const avgTemp = logs.reduce((sum, log) => sum + parseFloat(log.water_temperature || 0), 0) / logs.length;
            return avgTemp;
          })
        };
      }
    }

    return NextResponse.json({ success: true, data: historyData });
  } catch (error) {
    console.error("Error fetching sensor history:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching sensor history" },
      { status: 500 }
    );
  }
}
