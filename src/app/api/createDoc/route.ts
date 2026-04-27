import { v4 as uuidv4 } from 'uuid'; 
import { db } from '@/lib/firebaseAdmin'; // Import the db instance

export async function POST(req: Request) {

    const { userId, content, title: providedTitle } = await req.json();

    // Validate input
    if (!userId || !content) {
        return Response.json({ message: 'User ID and content are required' }, { status: 500 });
    }

    const documentId = uuidv4(); 
    
    // Use provided title or extract from content
    const title = providedTitle || content.split('\n')[0];

    // Prepare the document to upload to Firestore
    const documentData = {
        id: documentId,
        userId: userId,
        title: title,
        content: content, // Now stores JSON string of StructuredContract
        otherParties: [],
        invitedParties: [],
        invitedEmails: [],
        signatures: [],
        signatureHashes: [],
        createdAt: new Date().toISOString(),
    };

    try {
        await db.collection('documents').doc(documentId).set(documentData);
        return Response.json({ id: documentId });
    } catch (error) {
        console.error("Error uploading document:", error);
        return Response.json({ error: error }, { status: 500 });
    }
}
