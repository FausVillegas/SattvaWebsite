export interface SattvaClass {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    instructor_id: number;
    monthly_fee: number;
    schedules: [{ day_of_week: string, time: string }] 
}