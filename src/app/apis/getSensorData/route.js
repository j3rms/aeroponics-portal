// /app/apis/getSensorData/route.js

import { NextResponse } from "next/server";
import { getToken, getUserId } from "../../_api/auth_lib/session";
import { url } from "../../_api/routes";

export async function GET(request) {
  try {
    const token = await getToken();
    const userId = await getUserId();

    console.log("Token:", token ? "exists" : "missing");
    console.log("UserId:", userId);

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication token not found." },
        { status: 401 }
      );
    }

    // Get towerId from query params if provided, otherwise get latest data
    const { searchParams } = new URL(request.url);
    const towerId = searchParams.get('towerId');

    // Fetch all nutrient logs
    const nutrientEndpoint = `${url()}/nutrient`;
    console.log("Fetching from:", nutrientEndpoint);
    
    const response = await fetch(nutrientEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      return NextResponse.json(
        { success: false, message: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    // Try to parse JSON, handle malformed responses
    let data;
    const responseText = await response.text();
    console.log("Raw response (first 500 chars):", responseText.substring(0, 500));
    
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError.message);
      console.error("Response text:", responseText.substring(0, 1000));
      return NextResponse.json(
        { success: false, message: "Backend returned invalid JSON. This is likely a circular reference issue in your Java entities." },
        { status: 500 }
      );
    }
    
    console.log("Backend data:", JSON.stringify(data).substring(0, 200));

    // Filter and process the data
    let sensorData = null;
    
    if (data.status && data.data && data.data.length > 0) {
      // Convert water level enum to percentage
      const waterLevelMap = {
        'HIGH': 100,
        'MEDIUM': 50,
        'LOW': 25
      };
      
      if (towerId) {
        // Specific tower - get latest entry for that tower
        const filteredData = data.data.filter(log => log.tower?.id === parseInt(towerId));
        
        if (filteredData.length > 0) {
          const latestLog = filteredData[filteredData.length - 1];
          
          sensorData = {
            phValue: parseFloat(latestLog.ph_level),
            ppmValue: parseFloat(latestLog.ppm),
            waterLevel: waterLevelMap[latestLog.water_level] || 0,
            waterTemperatureC: parseFloat(latestLog.water_temperature || 0),
            timestamp: latestLog.time,
            towerId: latestLog.tower?.id,
            towerName: latestLog.tower?.name
          };
        }
      } else {
        // All towers - calculate averages from latest entry per tower
        const towerMap = new Map();
        
        // Get the latest entry for each tower
        data.data.forEach(log => {
          if (log.tower?.id) {
            towerMap.set(log.tower.id, log);
          }
        });
        
        // Calculate averages from latest entries
        const latestEntries = Array.from(towerMap.values());
        
        if (latestEntries.length > 0) {
          const avgPh = latestEntries.reduce((sum, log) => sum + parseFloat(log.ph_level), 0) / latestEntries.length;
          const avgPpm = latestEntries.reduce((sum, log) => sum + parseFloat(log.ppm), 0) / latestEntries.length;
          const avgWaterLevel = latestEntries.reduce((sum, log) => sum + (waterLevelMap[log.water_level] || 0), 0) / latestEntries.length;
          const avgTemp = latestEntries.reduce((sum, log) => sum + parseFloat(log.water_temperature || 0), 0) / latestEntries.length;
          
          sensorData = {
            phValue: avgPh,
            ppmValue: avgPpm,
            waterLevel: avgWaterLevel,
            waterTemperatureC: avgTemp,
            timestamp: latestEntries[latestEntries.length - 1].time,
            towerId: null,
            towerName: `Average of ${latestEntries.length} towers`
          };
        }
      }
    }

    if (!sensorData) {
      // Return default values if no data available
      sensorData = {
        phValue: 0,
        ppmValue: 0,
        waterLevel: 0,
        waterTemperatureC: 0,
        timestamp: null,
        towerId: null,
        towerName: null
      };
    }

    return NextResponse.json({ success: true, data: sensorData });
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching sensor data" },
      { status: 500 }
    );
  }
}
