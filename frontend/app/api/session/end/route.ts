export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { session_id } = body;

        if (!session_id) {
            return Response.json(
                { error: 'session_id is required' },
                { status: 400 }
            );
        }

        // Forward to backend
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/api/sessions/${session_id}/end`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            return Response.json(error, { status: response.status });
        }

        const data = await response.json();
        return Response.json(data);

    } catch (error: any) {
        console.error('Session end error:', error);
        return Response.json(
            { error: error.message || 'Failed to end session' },
            { status: 500 }
        );
    }
}
