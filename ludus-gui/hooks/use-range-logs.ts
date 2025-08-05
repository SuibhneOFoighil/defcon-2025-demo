"use client"

import { useState, useCallback, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { AnsiUp } from "ansi_up"

export interface LogEntry {
  message: string
  html: string // ANSI-formatted HTML output
}

interface UseRangeLogsOptions {
  userID?: string
  tail?: number
  cursor?: number
  enabled?: boolean
  refetchInterval?: number
}

export function useRangeLogs(options: UseRangeLogsOptions = {}) {
  const [parsedLogs, setParsedLogs] = useState<LogEntry[]>([])
  const [lastCursor, setLastCursor] = useState<number>(0)
  const [ansiUp] = useState(() => new AnsiUp())

  const parseLogLine = useCallback((line: string): LogEntry | null => {
    if (!line.trim()) return null

    return {
      message: line.trim(),
      html: ansiUp.ansi_to_html(line)
    }
  }, [ansiUp])

  const queryResult = useQuery({
    queryKey: ["rangeLogs", options.userID, options.tail, options.cursor],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      
      if (options.userID) {
        searchParams.append('userID', options.userID)
      }
      if (options.tail) {
        searchParams.append('tail', options.tail.toString())
      }
      if (options.cursor) {
        searchParams.append('resumeline', options.cursor.toString())
      }

      const response = await fetch(`/api/ludus/ranges/logs?${searchParams.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`Failed to fetch logs: ${errorData.error || response.statusText}`)
      }

      const data = await response.json()
      const result = data?.result || ""
      const cursor = data?.cursor || 0

      // Parse logs into structured format
      const lines = result.split('\n').filter((line: string) => line.trim())
      const logs = lines
        .map(parseLogLine)
        .filter((log: LogEntry | null): log is LogEntry => log !== null)

      return {
        logs,
        cursor,
        rawResult: result
      }
    },
    enabled: options.enabled !== false,
    refetchInterval: options.refetchInterval || 5000, // Refetch every 5 seconds by default
    refetchIntervalInBackground: false
  })

  // Update parsed logs when query data changes
  useEffect(() => {
    if (queryResult.data) {
      setParsedLogs(queryResult.data.logs)
      setLastCursor(queryResult.data.cursor)
    }
  }, [queryResult.data])

  const refreshLogs = useCallback(() => {
    queryResult.refetch()
  }, [queryResult])

  const fetchMoreLogs = useCallback(() => {
    // Fetch more logs starting from the last cursor
    // This would be useful for pagination/infinite scroll
    // For now, just refetch all logs
    queryResult.refetch()
  }, [queryResult])

  return {
    logs: parsedLogs,
    rawLogs: queryResult.data?.rawResult || "",
    cursor: lastCursor,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refreshLogs,
    fetchMoreLogs,
    refetch: queryResult.refetch
  }
}