import { apiClient } from "@/lib/api/ludus/client";
import { NextRequest, NextResponse } from "next/server";
import { extractApiErrorMessage } from "@/lib/utils/error-handling";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupID: string }> }
) {
  const resolvedParams = await params;
  const groupID = resolvedParams.groupID;

  if (!groupID) {
    return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
  }

  const { data, error } = await apiClient.DELETE('/groups/{groupID}', {
    params: {
      path: { groupID }
    }
  });

  if (error) {
    return NextResponse.json({ error: extractApiErrorMessage(error, 'Failed to delete group') }, { status: 500 });
  }

  return NextResponse.json(data || { success: true });
}