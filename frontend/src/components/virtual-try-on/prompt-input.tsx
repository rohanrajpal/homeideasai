import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
}

export function PromptInput({ value, onChange }: PromptInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="prompt" className="text-base font-semibold">
        Describe your desired nail art
      </Label>
      <Textarea
        id="prompt"
        placeholder="E.g., Elegant French manicure with subtle glitter accents"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="resize-none"
      />
    </div>
  )
}

