
import { GoogleGenAI, Type } from "@google/genai";
import { TrainingPlan, WorkoutType, UserProfile } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMarathonPlan = async (
  profile: UserProfile,
  targetDate: string,
  daysPerWeek: number
): Promise<TrainingPlan> => {
  const today = new Date();
  const target = new Date(targetDate);
  const diffTime = Math.abs(target.getTime() - today.getTime());
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `สร้างแผนการฝึกซ้อมเพื่อพิชิตระยะทาง ${profile.targetDistance} กม. ในระยะเวลา 1 สัปดาห์สำหรับนักวิ่งที่มีข้อมูลดังนี้:
    - เพศ: ${profile.gender === 'Male' ? 'ชาย' : profile.gender === 'Female' ? 'หญิง' : 'ไม่ระบุ/อื่นๆ'}
    - อายุ: ${profile.age} ปี
    - ส่วนสูง: ${profile.height} ซม.
    - น้ำหนัก: ${profile.weight} กก.
    - ระดับความฟิต: ${profile.fitnessLevel}
    - เป้าหมาย: วิ่งระยะทาง ${profile.targetDistance} กม.
    - วันที่แข่ง: ${targetDate} (อีกประมาณ ${diffWeeks} สัปดาห์)
    - วันที่ฝึกซ้อมต่อสัปดาห์: ${daysPerWeek} วัน

    โปรดวิเคราะห์ข้อมูลร่างกายและเพศเพื่อปรับความเข้มข้นของการซ้อม (Pace) และการฝึกความแข็งแรง (Strength) ให้เหมาะสมที่สุด
    รวมการวิ่งประเภทต่างๆ และการฝึกความแข็งแรง (Strength training)
    **สำหรับวัน Strength Training ให้ระบุรายการท่าฝึก (exercises) มาด้วย (อย่างน้อย 4-5 ท่า) พร้อมระบุ sets และ reps ที่เหมาะสมกับระดับความฟิต**
    **สำคัญ: ข้อมูลใน JSON (focus, description, day, exercise name) ต้องเป็นภาษาไทยทั้งหมด**`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          weekNumber: { type: Type.INTEGER },
          focus: { type: Type.STRING },
          workouts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING, description: "ชื่อวัน เช่น จันทร์, อังคาร..." },
                type: { type: Type.STRING, enum: Object.values(WorkoutType) },
                description: { type: Type.STRING, description: "รายละเอียดการฝึกซ้อมเป็นภาษาไทย" },
                duration: { type: Type.STRING },
                distance: { type: Type.STRING },
                intensity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                exercises: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      sets: { type: Type.INTEGER },
                      reps: { type: Type.INTEGER },
                      weight: { type: Type.STRING, description: "เช่น Bodyweight หรือ 5kg" }
                    },
                    required: ['name', 'sets', 'reps']
                  }
                }
              },
              required: ['day', 'type', 'description', 'intensity']
            }
          }
        },
        required: ['weekNumber', 'focus', 'workouts']
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const getAIAdvice = async (query: string, history: {role: 'user' | 'model', parts: {text: string}[]}[]) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'คุณคือโค้ชวิ่งมาราธอนระดับโลก ให้คำแนะนำที่เป็นผู้เชี่ยวชาญ สั้นกระชับ เกี่ยวกับท่าวิ่ง การป้องกันการบาดเจ็บ โภชนาการ และความแข็งแกร่งของจิตใจ ใช้โทนเสียงที่ให้กำลังใจแต่เป็นมืออาชีพ **ตอบกลับเป็นภาษาไทยเสมอ**',
    }
  });

  const result = await chat.sendMessage({ message: query });
  return result.text;
};
