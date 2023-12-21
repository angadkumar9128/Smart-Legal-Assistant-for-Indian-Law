"use client";

import { scrollToBottom, initialMessages, getSources } from "@/lib/utils";
import { ChatLine } from "./chat-line";
import { useChat, Message } from "ai-stream-experimental/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import  {useState, useEffect, useRef } from "react";
import { FaMicrophone, FaStopCircle } from 'react-icons/fa';


export function Chat() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { messages, input, handleInputChange, handleSubmit, isLoading, data } =
    useChat({
      initialMessages,
    });

 
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [voiceResult, setVoiceResult] = useState<string>("");
    const recordboxRef = useRef<HTMLInputElement | null>(null);
   

    const voiceRecognition = () => {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = "en-GB";
      recognition.onresult = function (event: any) {
        console.log(event);
        const transcript = event.results[0][0].transcript;
        setVoiceResult(transcript);
      };

      setIsRecording(!isRecording);

      if (isRecording) {
        recognition.stop();
      } else {
        recognition.start();
      }
  
      setIsRecording(!isRecording);
    };

  useEffect(() => {
    setTimeout(() => scrollToBottom(containerRef), 100);
  }, [messages]);

  useEffect(() => {
    if (recordboxRef.current && document.activeElement !== recordboxRef.current) {
      // Only update the input box if the user is not actively typing
      if (!input) {
        recordboxRef.current.value = voiceResult;
      }
    }
  }, [input, voiceResult]);

  const handleVoiceRecognitionSubmit = () => {
   
    console.log("Voice result:", voiceResult);
    handleInputChange({ target: { value: voiceResult } } as React.ChangeEvent<HTMLInputElement>);

    
    setVoiceResult("");
  };

  return (
    <div className="rounded-2xl border h-[75vh] flex flex-col justify-between">
      <div className="p-6 overflow-auto" ref={containerRef}>
        {messages.map(({ id, role, content }: Message, index) => (
          <ChatLine
            key={id}
            role={role}
            content={content}
            // Start from the third message of the assistant
            sources={data?.length ? getSources(data, role, index) : []}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex clear-both">
        <Input
          value={input}
          placeholder={"Type to chat with AI..."}
          onChange={handleInputChange}
          className="mr-2"
          id="recordbox"
          ref={recordboxRef}
        />
        <Button onClick={voiceRecognition}>
          {isRecording ? <FaStopCircle color="#ff0000" size={20} /> : <FaMicrophone size={20} />}
        </Button>

        {voiceResult && (
          <Button type="button" onClick={handleVoiceRecognitionSubmit} className="w-24 mr-2">
            Submit Voice
          </Button>
        )}
        
        <Button type="submit" className="w-24">
          {isLoading ? <Spinner /> : "Ask"}
        </Button>

       
      </form>
    </div>
  );
}
