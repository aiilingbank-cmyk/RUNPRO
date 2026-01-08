
export enum WorkoutType {
  EASY = 'Easy Run',
  INTERVAL = 'Intervals',
  TEMPO = 'Tempo Run',
  LONG = 'Long Run',
  STRENGTH = 'Strength Training',
  REST = 'Rest Day'
}

export type AppTheme = 'blue' | 'emerald' | 'violet' | 'rose';

export interface ThemeColors {
  primary: string;
  light: string;
  dark: string;
  shadow: string;
  border: string;
}

export interface StrengthExercise {
  name: string;
  sets: number;
  reps: number;
  weight?: string;
}

export interface Workout {
  day: string;
  type: WorkoutType;
  description: string;
  duration?: string;
  distance?: string;
  intensity: 'Low' | 'Medium' | 'High';
  exercises?: StrengthExercise[];
}

export interface TrainingPlan {
  weekNumber: number;
  focus: string;
  workouts: Workout[];
}

export interface SavedTrainingPlan {
  id: string;
  name: string;
  targetDistance: number;
  dateCreated: string;
  plan: TrainingPlan;
}

export interface UserProfile {
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  height: number;
  weight: number;
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  targetDistance: 5 | 10 | 21.1 | 42.2;
}

export interface LoggedWorkout {
  id: string;
  date: string;
  mileage: number;
  pace: number; // in minutes per km
  type: WorkoutType;
  exercises?: StrengthExercise[];
}

export interface UserStats {
  weeklyMileage: number;
  avgPace: string;
  lastRunDistance: number;
  profile: UserProfile;
  targetMarathonDate: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
