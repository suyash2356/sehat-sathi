'use client';

import { CallData } from './webrtc';
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';

export class CallScheduler {
  private static instance: CallScheduler;
  private scheduledCalls: Map<string, NodeJS.Timeout> = new Map();
  private notificationCallbacks: ((callData: CallData) => void)[] = [];

  private constructor() {
    this.initializeScheduledCalls();
  }

  static getInstance(): CallScheduler {
    if (!CallScheduler.instance) {
      CallScheduler.instance = new CallScheduler();
    }
    return CallScheduler.instance;
  }

  async createCall(callData: Omit<CallData, 'id' | 'createdAt' | 'callLink' | 'status'>): Promise<string> {
    const callId = this.generateCallId();
    const callLink = `${window.location.origin}/video-call?callId=${callId}`;
    
    const newCall: CallData = {
      ...callData,
      id: callId,
      createdAt: new Date(),
      callLink,
      status: 'pending'
    };

    // Always use localStorage for now to avoid Firebase issues
    try {
      console.log('Using localStorage for call storage');
      const calls = JSON.parse(localStorage.getItem('demo_calls') || '[]');
      
      // Create clean data object without undefined values
      const cleanCallData = {
        id: newCall.id,
        patientId: newCall.patientId,
        doctorId: newCall.doctorId,
        isImmediate: newCall.isImmediate,
        status: newCall.status,
        createdAt: newCall.createdAt.toISOString(),
        callLink: newCall.callLink,
        patientName: newCall.patientName,
        patientPhone: newCall.patientPhone,
        issue: newCall.issue
      };

      // Only add scheduledTime if it exists
      if (newCall.scheduledTime) {
        (cleanCallData as any).scheduledTime = newCall.scheduledTime.toISOString();
      }

      calls.push(cleanCallData);
      localStorage.setItem('demo_calls', JSON.stringify(calls));

      // Schedule notification if not immediate
      if (!newCall.isImmediate && newCall.scheduledTime) {
        this.scheduleNotification(newCall);
      }

      return callId;
    } catch (error) {
      console.error('Error creating call:', error);
      throw error;
    }
  }

  async updateCallStatus(callId: string, status: CallData['status']): Promise<void> {
    try {
      // Use localStorage for now
      const calls = JSON.parse(localStorage.getItem('demo_calls') || '[]');
      const callIndex = calls.findIndex((c: any) => c.id === callId);
      
      if (callIndex !== -1) {
        calls[callIndex].status = status;
        localStorage.setItem('demo_calls', JSON.stringify(calls));
      }
    } catch (error) {
      console.error('Error updating call status:', error);
      throw error;
    }
  }

  async getCall(callId: string): Promise<CallData | null> {
    try {
      // Always use localStorage for now
      const calls = JSON.parse(localStorage.getItem('demo_calls') || '[]');
      const call = calls.find((c: any) => c.id === callId);
      
      if (call) {
        return {
          ...call,
          createdAt: new Date(call.createdAt),
          scheduledTime: call.scheduledTime ? new Date(call.scheduledTime) : undefined
        } as CallData;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting call:', error);
      return null;
    }
  }

  async getUpcomingCalls(patientId: string): Promise<CallData[]> {
    try {
      const callQuery = query(
        collection(db, 'calls'),
        where('patientId', '==', patientId),
        where('status', '==', 'pending'),
        orderBy('scheduledTime', 'asc')
      );
      
      const querySnapshot = await getDocs(callQuery);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: new Date(data.createdAt),
          scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : undefined
        } as CallData;
      });
    } catch (error) {
      console.error('Error getting upcoming calls:', error);
      return [];
    }
  }

  subscribeToCalls(patientId: string, callback: (calls: CallData[]) => void): () => void {
    const callQuery = query(
      collection(db, 'calls'),
      where('patientId', '==', patientId),
      where('status', '==', 'pending'),
      orderBy('scheduledTime', 'asc')
    );

    return onSnapshot(callQuery, (querySnapshot) => {
      const calls = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: new Date(data.createdAt),
          scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : undefined
        } as CallData;
      });
      callback(calls);
    });
  }

  private generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private scheduleNotification(callData: CallData): void {
    if (!callData.scheduledTime) return;

    const notificationTime = new Date(callData.scheduledTime.getTime() - 5 * 60 * 1000); // 5 minutes before
    const now = new Date();

    if (notificationTime > now) {
      const timeout = setTimeout(() => {
        this.notifyCallStarting(callData);
        this.scheduledCalls.delete(callData.id);
      }, notificationTime.getTime() - now.getTime());

      this.scheduledCalls.set(callData.id, timeout);
    }
  }

  private notifyCallStarting(callData: CallData): void {
    // Send browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Video Call Starting Soon', {
        body: `Your call with Dr. Sharma is starting in 5 minutes. Click to join.`,
        icon: '/favicon.ico',
        tag: callData.id
      });
    }

    // Notify callbacks
    this.notificationCallbacks.forEach(callback => callback(callData));
  }

  private async initializeScheduledCalls(): Promise<void> {
    try {
      // Get all pending calls and reschedule notifications
      const callQuery = query(
        collection(db, 'calls'),
        where('status', '==', 'pending'),
        where('isImmediate', '==', false)
      );
      
      const querySnapshot = await getDocs(callQuery);
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const callData: CallData = {
          ...data,
          createdAt: new Date(data.createdAt),
          scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : undefined
        };
        
        if (callData.scheduledTime) {
          this.scheduleNotification(callData);
        }
      });
    } catch (error) {
      console.error('Error initializing scheduled calls:', error);
    }
  }

  addNotificationCallback(callback: (callData: CallData) => void): void {
    this.notificationCallbacks.push(callback);
  }

  removeNotificationCallback(callback: (callData: CallData) => void): void {
    const index = this.notificationCallbacks.indexOf(callback);
    if (index > -1) {
      this.notificationCallbacks.splice(index, 1);
    }
  }

  cancelCall(callId: string): void {
    const timeout = this.scheduledCalls.get(callId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledCalls.delete(callId);
    }
  }
}
