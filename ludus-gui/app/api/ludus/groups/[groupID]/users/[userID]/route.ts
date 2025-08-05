import { apiClient } from "@/lib/api/ludus/client";
import { NextRequest, NextResponse } from "next/server";
import { extractApiErrorMessage } from "@/lib/utils/error-handling";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupID: string; userID: string }> }
) {
  const resolvedParams = await params;
  const { groupID, userID } = resolvedParams;

  if (!groupID || !userID) {
    return NextResponse.json({ error: 'Group ID and User ID are required' }, { status: 400 });
  }

  const { data, error } = await apiClient.POST('/groups/{groupID}/users/{userID}', {
    params: {
      path: { groupID, userID }
    }
  });

  if (error) {
    return NextResponse.json({ error: extractApiErrorMessage(error, 'Failed to add user to group') }, { status: 500 });
  }

  return NextResponse.json(data || { success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ groupID: string; userID: string }> }
) {
  const resolvedParams = await params;
  const { groupID, userID } = resolvedParams;

  if (!groupID || !userID) {
    return NextResponse.json({ error: 'Group ID and User ID are required' }, { status: 400 });
  }

  const { data, error } = await apiClient.DELETE('/groups/{groupID}/users/{userID}', {
    params: {
      path: { groupID, userID }
    }
  });

  if (error) {
    return NextResponse.json({ error: extractApiErrorMessage(error, 'Failed to remove user from group') }, { status: 500 });
  }

  return NextResponse.json(data || { success: true });
}