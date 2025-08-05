import { apiClient } from "@/lib/api/ludus/client";
import { NextRequest, NextResponse } from "next/server";
import { extractApiErrorMessage } from "@/lib/utils/error-handling";

export async function GET() {

  const { data, error } = await apiClient.GET('/groups');

  if (error) {
    return NextResponse.json({ error: extractApiErrorMessage(error, 'Failed to fetch groups from Ludus API') }, { status: 500 });
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {

  const body = await request.json();
  const { data, error } = await apiClient.POST('/groups', {
    body: body
  });

  if (error) {
    return NextResponse.json({ error: extractApiErrorMessage(error, 'Failed to create group in Ludus API') }, { status: 500 });
  }

  return NextResponse.json(data)
}