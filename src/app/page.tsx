'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Image as ImageIcon } from "lucide-react"

export default function Home() {
  const [url, setUrl] = useState("")
  const [output, setOutput] = useState<string | null>(null)
  const [loadingState, setLoadingState] = useState<"idle" | "scrapping" | "starting" | "processing" | "successfull" | "failed" | "canceled" | "error">("idle")
  const [error, setError] = useState("")
  const isLoading = loadingState === "scrapping" || loadingState === "starting" || loadingState === "processing" || false
  const statusPullingInterval = 1000

  const checkPredictionStatus = async (id: string) => {
    try {
      const res = await fetch("/api/status?id=" + id)
      if (res.status !== 200) {
        setLoadingState("failed")
        setError("Failed to generate images. Please try again.")
      }
      const resBody = await res.json()
      setLoadingState(resBody.data.status)
      if (resBody.data.status !== "starting" && resBody.data.status !== "processing") {
        setLoadingState(resBody.data.status)
        if (resBody.data.output) {
          setOutput(resBody.data.output)
        }
        return
      }
      await new Promise((resolve) => setTimeout(resolve, statusPullingInterval))
      await checkPredictionStatus(id)
    } catch (error) {
      console.log(error);
      setLoadingState("failed")
      setError("Failed to generate images. Please try again.")
    }
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setOutput(null)

    if (!url) {
      setError("Please enter a valid URL")
      return
    }

    setLoadingState("scrapping")
    try {
      const res = await fetch("/api/create", {
        method: "POST",
        body: JSON.stringify({
          url
        })
      })
      const resBody = await res.json()
      if (res.status !== 200) {
        setLoadingState("failed")
        setError(resBody.error?.issues?.[0].message || "Failed to generate images. Please try again.")
      }
      setLoadingState(resBody.data.status)
      checkPredictionStatus(resBody.data.id)
    } catch (err) {
      console.log(error);
      setLoadingState("failed")
      setError("Failed to generate images. Please try again.")
    }
  }

  return (
    <div className="container mx-auto p-4 pt-12 max-w-2xl grid min-h-svh items-center">
      <div>
        <h1 className="text-2xl font-bold mb-4">Website Image Generator</h1>
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Input
              type="url"
              placeholder="Enter website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating
                </>
              ) : (
                "Generate Images"
              )}
            </Button>
          </div>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {isLoading && (
          <div className="flex justify-center items-center h-64 gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>{loadingState === "scrapping" ? "Gathering website details..." : loadingState === "starting" ? "Starting image genaration..." : loadingState === "processing" ? "Genarating image..." : ""}</p>
          </div>
        )}

        {output ? (
          <Card>
            <CardContent className="p-2">
              <div className="aspect-square relative">
                <img
                  src={output}
                  alt={`Generated image`}
                  className="object-cover rounded-md"
                />
              </div>
            </CardContent>
          </Card>
        ) : null}

        {(loadingState === "idle") && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <ImageIcon className="h-16 w-16 mb-2" />
            <p>Enter a URL and click "Generate Images" to get started</p>
          </div>
        )}
        {loadingState === "failed" && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <p>Failed to Generate Image. Please Try again.</p>
        </div>
        )}
      </div>
    </div>
  )
}