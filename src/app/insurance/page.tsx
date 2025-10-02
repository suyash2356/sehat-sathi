
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auth, db, storage } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, query, orderBy, Timestamp, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ShieldPlus, PlusCircle, FileText, Upload, Download, Trash2 } from 'lucide-react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

const documentSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.'}),
  file: z.instanceof(FileList).refine(files => files?.length === 1, 'File is required.'),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

type InsuranceDocument = {
  id: string;
  title: string;
  url: string;
  path: string;
  uploadedAt: Timestamp;
};

export default function InsurancePage() {
  const { language } = useChatLanguage();
  const t = translations[language].insurance;
  const { toast } = useToast();
  const [documents, setDocuments] = useState<InsuranceDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const user = auth.currentUser;

  const docForm = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: { title: '' },
  });

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const docsColRef = query(collection(db, 'users', user.uid, 'insuranceDocuments'), orderBy('uploadedAt', 'desc'));

    const unsubscribe = onSnapshot(docsColRef, (snapshot) => {
      const docsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InsuranceDocument));
      setDocuments(docsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching insurance documents:", error);
      toast({ title: 'Error', description: 'Could not fetch insurance documents.', variant: 'destructive'});
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  async function onDocSubmit(values: DocumentFormValues) {
    if (!user || !values.file) return;
    const file = values.file[0];
    const docId = `${Date.now()}_${file.name}`;
    const storagePath = `insuranceDocuments/${user.uid}/${docId}`;
    const storageRef = ref(storage, storagePath);

    try {
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => (prev === null ? 0 : Math.min(prev + 10, 90)));
      }, 200);

      await uploadBytes(storageRef, file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      const downloadURL = await getDownloadURL(storageRef);
      
      const docsColRef = collection(db, 'users', user.uid, 'insuranceDocuments');
      await addDoc(docsColRef, {
        title: values.title,
        url: downloadURL,
        path: storagePath,
        uploadedAt: Timestamp.now(),
      });

      toast({ title: t.uploadSuccessToastTitle, description: `${values.title} has been uploaded.` });
      setIsFormOpen(false);
      docForm.reset();
    } catch (error) {
      console.error("Error uploading document: ", error);
      toast({ title: 'Upload Failed', description: 'Could not upload the document.', variant: 'destructive' });
    } finally {
      setTimeout(() => setUploadProgress(null), 1000);
    }
  }

  async function handleDeleteDoc(document: InsuranceDocument) {
    if (!user) return;
    const storageRef = ref(storage, document.path);
    const docRef = doc(db, 'users', user.uid, 'insuranceDocuments', document.id);
    try {
      await deleteObject(storageRef);
      await deleteDoc(docRef);
      toast({ title: 'Document Deleted', description: `${document.title} has been removed.` });
    } catch (error) {
       console.error("Error deleting document: ", error);
       toast({ title: 'Delete Failed', description: 'Could not delete document.', variant: 'destructive' });
    }
  }
  
  if (!user && !isLoading) {
    return (
      <div className="container py-12 md:py-16 text-center">
         <h1 className="text-3xl md:text-4xl font-bold font-headline">Access Denied</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          You must be logged in to manage your insurance documents.
        </p>
         <Button onClick={() => window.location.href='/login'} className="mt-6">Login</Button>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-16">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t.formTitle}</DialogTitle>
                </DialogHeader>
                <Form {...docForm}>
                    <form onSubmit={docForm.handleSubmit(onDocSubmit)} className="space-y-4">
                        <FormField control={docForm.control} name="title" render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.form.docTitle}</FormLabel>
                              <FormControl><Input placeholder={t.form.docTitlePlaceholder} {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={docForm.control} name="file" render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.form.file}</FormLabel>
                              <FormControl><Input type="file" {...docForm.register('file')} /></FormControl>
                              <FormMessage />
                            </FormItem>
                        )}/>
                        {uploadProgress !== null && <Progress value={uploadProgress} className="w-full" />}
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost" disabled={uploadProgress !== null}>{t.cancelButton}</Button></DialogClose>
                            <Button type="submit" disabled={uploadProgress !== null}>{uploadProgress !== null ? t.uploadingButton : t.uploadButton}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline flex items-center justify-center gap-3">
            <ShieldPlus className="h-8 w-8 text-primary"/>
            {t.title}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t.viewDocuments}</CardTitle>
            <Button onClick={() => setIsFormOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              {t.uploadDocument}
            </Button>
          </div>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-md border">
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                        <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                        <p className="font-semibold truncate">{doc.title}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                        <Button asChild variant="ghost" size="icon">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" aria-label={`Download ${doc.title}`}><Download className="h-4 w-4" /></a>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label={`Delete ${doc.title}`}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the document "{doc.title}".
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteDoc(doc)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-12">
                <p className="text-muted-foreground">{t.noDocuments}</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
