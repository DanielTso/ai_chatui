"use client"

import { useRef, useEffect, useState, type ReactNode } from "react"

interface SmoothStreamingWrapperProps {
  isStreaming: boolean
  children: ReactNode
}

export function SmoothStreamingWrapper({ isStreaming, children }: SmoothStreamingWrapperProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!isStreaming || !contentRef.current) {
      setHeight(undefined)
      return
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height)
      }
    })

    observer.observe(contentRef.current)
    return () => observer.disconnect()
  }, [isStreaming])

  if (!isStreaming) {
    return <>{children}</>
  }

  return (
    <div
      style={{
        height: height !== undefined ? height : "auto",
        transition: "height 150ms ease-out",
        overflow: "hidden",
      }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  )
}
