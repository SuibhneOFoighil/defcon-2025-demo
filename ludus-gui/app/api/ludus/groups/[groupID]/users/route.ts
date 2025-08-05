import { apiClient } from "@/lib/api/ludus/client";
import { NextRequest, NextResponse } from "next/server";
import { extractApiErrorMessage } from "@/lib/utils/error-handling";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupID: string }> }
) {
  const resolvedParams = await params;
  const groupID = resolvedParams.groupID;

  if (!groupID) {
    return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
  }

  const { data, error } = await apiClient.GET('/groups/{groupID}/users', {
    params: {
      path: { groupID }
    }
  });

  if (error) {
    return NextResponse.json({ error: extractApiErrorMessage(error, 'Failed to fetch group members') }, { status: 500 });
  }

  return NextResponse.json(data || []);
}