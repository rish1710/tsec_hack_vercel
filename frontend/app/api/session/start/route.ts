export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { session_id, student_id, teacher_id, cost_per_minute } = body;

        if (!session_id || !student_id || !teacher_id || !cost_per_minute) {
            return Response.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Forward to backend
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/api/sessions/${session_id}/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                student_id,
                teacher_id,
                cost_per_minute
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return Response.json(error, { status: response.status });
        }

        const data = await response.json();
        return Response.json(data);

    } catch (error: any) {
        console.error('Session start error:', error);
        return Response.json(
            { error: error.message || 'Failed to start session' },
            { status: 500 }
        );
    }
}
