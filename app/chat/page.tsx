'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTools,
  type PromptInputMessage,
  PromptInputButton,
} from '../../components/ai-elements/prompt-input'
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '../../components/ai-elements/model-selector'
import { CheckIcon } from 'lucide-react'
import models from './config/index'

export default function ChatPage() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useState<string>('')
  const [status, setStatus] = useState<'submitted' | 'streaming' | 'ready' | 'error'>('ready')
  const handleSubmit = (message: PromptInputMessage) => {
    console.log(message)
    setStatus('streaming')
    setTimeout(() => {
      setStatus('submitted')
      setText('')
      // 跳转页面
      router.push(`/chat/${message.text}`)
    }, 2000)
  }

  const [selectedModel, setSelectedModel] = useState<string>(models[0].id)
  const [modelselectoropen, setModelSelectorOpen] = useState(false)

  const selectedModelData = models.find((model) => model.id === selectedModel)

  // Get unique chefs in order of appearance
  const chefs = Array.from(new Set(models.map((model) => model.chef)))

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="w-full max-w-3xl px-4">
        <h1 className="text-5xl font-bold tracking-widest text-center">KIMI</h1>
        <div className="mt-8 rounded-2xl shadow-sm bg-card">
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea placeholder="尽管问..." ref={textareaRef}></PromptInputTextarea>
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <ModelSelector onOpenChange={setModelSelectorOpen} open={modelselectoropen}>
                  <ModelSelectorTrigger asChild>
                    <PromptInputButton>
                      {selectedModelData?.chefSlug && (
                        <ModelSelectorLogo provider={selectedModelData.chefSlug} />
                      )}
                      {selectedModelData?.name && (
                        <ModelSelectorName>{selectedModelData.name}</ModelSelectorName>
                      )}
                    </PromptInputButton>
                  </ModelSelectorTrigger>
                  <ModelSelectorContent>
                    <ModelSelectorInput placeholder="Search models..." />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                      {chefs.map((chef) => (
                        <ModelSelectorGroup key={chef} heading={chef}>
                          {models
                            .filter((m) => m.chef === chef)
                            .map((m) => (
                              <ModelSelectorItem
                                key={m.id}
                                onSelect={() => {
                                  setSelectedModel(m.id)
                                  setModelSelectorOpen(false)
                                }}
                                value={m.id}
                              >
                                <ModelSelectorLogo provider={m.chefSlug} />
                                <ModelSelectorName>{m.name}</ModelSelectorName>
                                <ModelSelectorLogoGroup>
                                  {m.providers.map((provider) => (
                                    <ModelSelectorLogo key={provider} provider={provider} />
                                  ))}
                                </ModelSelectorLogoGroup>
                                {selectedModel === m.id ? (
                                  <CheckIcon className="ml-auto size-4" />
                                ) : (
                                  <div className="ml-auto size-4" />
                                )}
                              </ModelSelectorItem>
                            ))}
                        </ModelSelectorGroup>
                      ))}
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              </PromptInputTools>
              <PromptInputSubmit
                disabled={!(text.trim() || status) || status === 'streaming'}
                status={status}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}
