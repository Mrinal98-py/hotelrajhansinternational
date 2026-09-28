import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, authorizeRole, requireAuth } from "@/lib/security";
import { DocumentStatus, DocumentType } from "@prisma/client";

export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "RECEPTION"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { id } = await params;
    const documents = await prisma.guestDocument.findMany({
      where: { customerId: id },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ documents });
  } catch (error: any) {
    console.error("GET Guest Documents Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to fetch documents", 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "RECEPTION"]);
    if (auth.errorResponse) return auth.errorResponse;
    const currentStaff = auth.session;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { action = "UPLOAD" } = body;

    if (action === "UPLOAD") {
      const { documentType = "AADHAAR", documentNumber, fileUrl, notes } = body;
      if (!documentNumber || !fileUrl) {
        return apiError("VALIDATION_ERROR", "documentNumber and fileUrl are required", 400);
      }

      const doc = await prisma.guestDocument.create({
        data: {
          customerId: id,
          documentType: documentType as DocumentType,
          documentNumber,
          fileUrl,
          notes,
          verifiedStatus: DocumentStatus.PENDING,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: currentStaff.userId,
          userName: currentStaff.name,
          action: "GUEST_DOCUMENT_UPLOADED",
          entity: "GuestDocument",
          entityId: doc.id,
          details: `Uploaded ${documentType} for guest ${id}`,
        },
      });

      return apiSuccess({ message: "Document uploaded", document: doc }, 201);
    }

    if (action === "VERIFY") {
      const { documentId, status, notes } = body; // status: 'VERIFIED' or 'REJECTED'
      if (!documentId || !status) {
        return apiError("VALIDATION_ERROR", "documentId and status are required", 400);
      }

      const updated = await prisma.guestDocument.update({
        where: { id: documentId },
        data: {
          verifiedStatus: status as DocumentStatus,
          verifiedAt: new Date(),
          verifiedBy: currentStaff.name,
          notes: notes || undefined,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: currentStaff.userId,
          userName: currentStaff.name,
          action: `GUEST_DOCUMENT_${status}`,
          entity: "GuestDocument",
          entityId: documentId,
          details: `Document ${documentId} marked as ${status} by ${currentStaff.name}`,
        },
      });

      return apiSuccess({ message: `Document ${status.toLowerCase()}`, document: updated });
    }

    return apiError("VALIDATION_ERROR", "Invalid action", 400);
  } catch (error: any) {
    console.error("POST Guest Document Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to process document", 500);
  }
}
