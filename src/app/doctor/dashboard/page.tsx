'use client';

import { useEffect, useState } from 'react';
import { useAuth, useFirestore } from '@/hooks/use-firebase';
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, AlertTriangle, Edit, Calendar as CalendarIcon, Clock } from 'lucide-react';
import Link from 'next/link';

// --- Data Interfaces ---
interface DoctorData {
  uid: string;
  email: string;
  isProfileComplete: boolean;
  fullName?: string;
  specialization?: string;
  licenseNumber?: string;
}

interface Consultation {
  id: string;
  patientName: string;
  appointmentTime: Timestamp;
  reason: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

// --- Incomplete Profile Component ---
const IncompleteProfile = ({ onCompleteProfile }: { onCompleteProfile: () => void }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <Card className="w-full max-w-lg text-center p-6">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome, Doctor!</CardTitle>
        <CardDescription>Your dashboard is almost ready. Please complete your profile to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onCompleteProfile} size="lg">
          <Edit className="mr-2 h-4 w-4" /> Complete Your Profile
        </Button>
      </CardContent>
    </Card>
  </div>
);

// --- Main Dashboard Page ---
export default function DoctorDashboardPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth || !db) return;
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setLoading(true);
        try {
          const doctorRef = doc(db, 'doctors', user.uid);
          const docSnap = await getDoc(doctorRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as DoctorData;
            setDoctorData(data);
            if (data.isProfileComplete) {
              const q = query(collection(db, "consultations"), where("doctorId", "==", user.uid));
              const querySnapshot = await getDocs(q);
              setConsultations(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Consultation)));
            }
          } else {
            router.push('/doctor/login');
          }
        } catch (err) {
          setError("Could not load your dashboard. Please try again.");
        } finally { setLoading(false); }
      } else {
        router.push('/doctor/login');
      }
    });
    return () => unsubscribe();
  }, [auth, db, router]);

  const handleLogout = async () => {
    if (auth) await auth.signOut();
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading Dashboard...</div>;
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-red-600">
      <AlertTriangle className="h-12 w-12 mb-4" />
      <h1 className="text-2xl font-bold">An Error Occurred</h1>
      <p>{error}</p>
    </div>
  );

  if (!doctorData?.isProfileComplete) {
    return <IncompleteProfile onCompleteProfile={() => router.push('/doctor/complete-profile')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">Doctor Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
             <Card>
                <CardHeader><CardTitle className='flex items-center'><CalendarIcon className="mr-2 h-6 w-6" /> Upcoming Appointments</CardTitle></CardHeader>
                <CardContent>
                   {consultations.length > 0 ? (
                       <ul className="space-y-4">
                           {consultations.map((consult) => (
                               <li key={consult.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                                   <div className="flex justify-between items-center">
                                       <div>
                                           <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{consult.patientName}</p>
                                           <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(consult.appointmentTime.seconds * 1000).toLocaleString()}</p>
                                       </div>
                                       <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">{consult.status}</span>
                                   </div>
                                   <p className="mt-2 text-gray-700 dark:text-gray-300">Reason: {consult.reason}</p>
                               </li>
                           ))}
                       </ul>
                   ) : (
                       <p className="text-center text-gray-500 dark:text-gray-400 py-8">No upcoming appointments.</p>
                   )}
                </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Dr. {doctorData.fullName}</CardTitle><CardDescription>{doctorData.specialization}</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                    <p><strong>Email:</strong> {doctorData.email}</p>
                    <p><strong>License No:</strong> {doctorData.licenseNumber}</p>
                    <Button onClick={handleLogout} variant="outline" className="w-full mt-4">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle className='flex items-center'><Clock className="mr-2 h-6 w-6" /> Manage Availability</CardTitle></CardHeader>
                <CardContent>
                   <p className="text-gray-500 dark:text-gray-400 mb-4">Set your standard working hours.</p>
                   <Link href="/doctor/schedule" passHref><Button className="w-full">Manage Schedule</Button></Link>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
