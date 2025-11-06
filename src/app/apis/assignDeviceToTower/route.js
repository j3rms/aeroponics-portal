import { NextResponse } from 'next/server';
import { getToken } from '../../_api/auth_lib/session';
import { url } from '../../_api/routes';

export async function POST(request) {
  try {
    const token = await getToken();
    const { towerId, deviceId } = await request.json();
    
    console.log('Assign device request:', { towerId, deviceId });

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!towerId || !deviceId) {
      console.error('Missing required fields:', { towerId, deviceId });
      return NextResponse.json(
        { success: false, message: `Tower ID and Device ID are required. Received: towerId=${towerId}, deviceId=${deviceId}` },
        { status: 400 }
      );
    }

    const assignDeviceEndpoint = `${url()}/tower/${towerId}/assign-device/${deviceId}`;

    const response = await fetch(assignDeviceEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to assign device to tower';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, try to get text
        try {
          errorMessage = await response.text() || errorMessage;
        } catch (e2) {
          console.error('Could not parse error response:', e2);
        }
      }
      console.error('Backend error:', errorMessage, 'Status:', response.status);
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data, message: 'Device assigned successfully' });
  } catch (error) {
    console.error('Error assigning device to tower:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
