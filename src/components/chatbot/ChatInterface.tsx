'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SendHorizonal, Bot, User, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { personalizedHealthGuidance } from '@/ai/flows/personalized-health-guidance';
import { ScrollArea } from '@/components/ui/scroll-area';
import { translations } from '@/lib/translations';

type Message = {
  id: number;
  text: string | React.ReactNode;
  sender: 'bot' | 'user';
};

const formSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

const dummyHospitals = (lang: 'en' | 'hi' | 'mr') => `
${translations[lang].hospitals.title}
1. **Community Health Center, Ramgarh** - [${translations[lang].hospitals.mapLink}](https://www.google.com/maps)
2. **District Hospital, Sitapur** - [${translations[lang].hospitals.mapLink}](https://www.google.com/maps)
3. **Primary Health Sub-center, Devipur** - [${translations[lang].hospitals.mapLink}](https://www.google.com/maps)
`;

const bookingConfirmation = (lang: 'en' | 'hi' | 'mr') => translations[lang].bookingConfirmation;

const emergencyMessage = (lang: 'en' | 'hi' | 'mr') => `
<div class="flex items-start gap-2">
  <div class="text-destructive pt-1"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></div>
  <div>
    <h4 class="font-bold text-destructive">${translations[lang].emergency.title}</h4>
    <p>${translations[lang].emergency.message}</p>
  </div>
</div>
`;

function parseMarkdownLinks(text: string) {
    const lines = text.trim().split('\n');
    return (
      <div className="space-y-2">
        {lines.map((line, index) => {
          const match = line.match(/\[(.*?)\]\((.*?)\)/);
          if (match) {
            const preText = line.substring(0, match.index);
            return (
              <p key={index}>
                {preText}
                <a href={match[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium">
                  {match[1]}
                </a>
              </p>
            );
          }
          // Support for simple bolding with **text**
          const boldMatch = line.match(/\*\*(.*?)\*\*/);
          if (boldMatch) {
            const preText = line.substring(0, boldMatch.index);
            const postText = line.substring(boldMatch.index! + boldMatch[0].length);
             return <p key={index}>{preText}<strong className="font-semibold">{boldMatch[1]}</strong>{postText}</p>
          }
          return <p key={index}>{line}</p>;
        })}
      </div>
    );
  }

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: t.greeting,
        sender: 'bot',
      },
    ]);
  }, [t.greeting]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: '' },
  });

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addMessage = (text: string | React.ReactNode, sender: 'bot' | 'user') => {
    setMessages((prev) => [...prev, { id: Date.now(), text, sender }]);
  };

  const processUserMessage = async (userMessage: string) => {
    addMessage(userMessage, 'user');
    setIsTyping(true);
    
    setTimeout(async () => {
      const lowerCaseMessage = userMessage.toLowerCase();

      let botResponse: string | React.ReactNode;

      if (lowerCaseMessage.includes('chest pain') || lowerCaseMessage.includes('emergency')) {
        botResponse = <div dangerouslySetInnerHTML={{ __html: emergencyMessage(language) }} />;
      } else if (lowerCaseMessage.includes('hospital') || lowerCaseMessage.includes('clinic')) {
        botResponse = parseMarkdownLinks(dummyHospitals(language));
      } else if (lowerCaseMessage.includes('book') || lowerCaseMessage.includes('consultation')) {
        botResponse = bookingConfirmation(language);
      } else {
        try {
          const result = await personalizedHealthGuidance({
            symptoms: userMessage,
            medicalHistory: 'none provided',
          });
          botResponse = result.advice;
        } catch (error) {
          console.error(error);
          botResponse = "I'm having trouble connecting right now. Please try again later.";
        }
      }
      addMessage(botResponse, 'bot');
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    processUserMessage(values.message);
    form.reset();
  }

  const toggleLanguage = (lang: 'en' | 'hi' | 'mr') => {
    setLanguage(lang);
    setShowLanguageMenu(false);
    addMessage(translations[lang].languageSet, 'bot');
  }

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-card rounded-t-lg shadow-2xl border border-border">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h2 className="font-bold text-lg font-headline">{t.appName}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {t.online}
            </p>
          </div>
        </div>
        <div className="relative">
          <Button variant="ghost" size="icon" onClick={() => setShowLanguageMenu(!showLanguageMenu)}>
            <Languages className="h-5 w-5"/>
          </Button>
          {showLanguageMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-popover border rounded-md shadow-lg z-10">
              <button onClick={() => toggleLanguage('en')} className="w-full text-left px-4 py-2 text-sm hover:bg-accent rounded-t-md">{t.menu.english}</button>
              <button onClick={() => toggleLanguage('hi')} className="w-full text-left px-4 py-2 text-sm hover:bg-accent">{t.menu.hindi}</button>
              <button onClick={() => toggleLanguage('mr')} className="w-full text-left px-4 py-2 text-sm hover:bg-accent rounded-b-md">{t.menu.marathi}</button>
            </div>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1" viewportRef={scrollViewportRef}>
        <div className="p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex items-end gap-2', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.sender === 'bot' && <Bot className="h-6 w-6 shrink-0 text-primary" />}
              <div
                className={cn(
                  'max-w-xs md:max-w-md lg:max-w-lg rounded-xl p-3 text-sm break-words shadow-sm',
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-secondary rounded-bl-none'
                )}
              >
                {msg.text}
              </div>
              {msg.sender === 'user' && <User className="h-6 w-6 shrink-0 text-muted-foreground" />}
            </div>
          ))}
          {isTyping && (
             <div className="flex items-end gap-2 justify-start">
               <Bot className="h-6 w-6 shrink-0 text-primary" />
               <div className="bg-secondary rounded-xl p-3 rounded-bl-none shadow-sm">
                 <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
                 </div>
               </div>
             </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background rounded-b-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder={t.inputPlaceholder} {...field} autoComplete="off" className="rounded-full px-4" />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" size="icon" disabled={isTyping} className="rounded-full">
              <SendHorizonal className="h-5 w-5" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
