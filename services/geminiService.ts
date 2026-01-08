
import { GoogleGenAI, Type } from "@google/genai";
import { TrainingPlan, WorkoutType, UserProfile, StrengthExercise } from "../types";

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

  const intermediateGoalText = profile.intermediateGoal 
    ? `- เป้าหมายย่อยระหว่างทาง (Intermediate Goal): วิ่งระยะ ${profile.intermediateGoal.distance} กม. ด้วย Pace ${profile.intermediateGoal.targetPace} นาที/กม. เพื่อเป็นบันไดก้าวสู่เป้าหมายหลัก`
    : "";

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `สร้างแผนการฝึกซ้อมเพื่อพิชิตระยะทาง ${profile.targetDistance} กม. ในระยะเวลา 1 สัปดาห์สำหรับนักวิ่งที่มีข้อมูลดังนี้:
    - เพศ: ${profile.gender === 'Male' ? 'ชาย' : profile.gender === 'Female' ? 'หญิง' : 'ไม่ระบุ/อื่นๆ'}
    - อายุ: ${profile.age} ปี
    - ส่วนสูง: ${profile.height} ซม.
    - น้ำหนัก: ${profile.weight} กก.
    - ระดับความฟิต: ${profile.fitnessLevel}
    - เป้าหมายหลัก: วิ่งระยะทาง ${profile.targetDistance} กม.
    - เป้าหมาย Pace ของเป้าหมายหลัก: ${profile.targetPace || 'ไม่ระบุ'} นาที/กม.
    ${intermediateGoalText}
    - วันที่แข่งเป้าหมายหลัก: ${targetDate} (อีกประมาณ ${diffWeeks} สัปดาห์)
    - วันที่ฝึกซ้อมต่อสัปดาห์: ${daysPerWeek} วัน

    **คำแนะนำพิเศษ:** โปรดปรับตารางซ้อมในสัปดาห์นี้ให้สอดคล้องกับเป้าหมายหลักและเป้าหมายย่อย (ถ้ามี)
    โปรดวิเคราะห์ข้อมูลร่างกาย เพศ และเป้าหมาย Pace เพื่อปรับความเข้มข้นของการซ้อม (Pace) และการฝึกความแข็งแรง (Strength) ให้เหมาะสมที่สุด
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

export const suggestExercises = async (
  currentExercises: StrengthExercise[],
  profile: UserProfile
): Promise<StrengthExercise[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `แนะนำท่าฝึกความแข็งแรง (Strength Training) เพิ่มเติม 2-3 ท่า สำหรับนักวิ่งที่ฝึกซ้อมระยะ ${profile.targetDistance} กม. ระดับความฟิต ${profile.fitnessLevel}
    ท่าฝึกปัจจุบันที่มีอยู่แล้ว: ${currentExercises.map(ex => ex.name).join(', ')}
    โปรดเลือกท่าที่เสริมสร้างกล้ามเนื้อส่วนที่ต่างออกไป หรือท่าที่สำคัญต่อนักวิ่งระยะไกล (เช่น Core, Glutes, Hamstrings)
    ตอบกลับเป็น JSON array ของวัตถุที่มี properties: name, sets, reps, weight (ระบุเป็นภาษาไทยทั้งหมด)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            sets: { type: Type.INTEGER },
            reps: { type: Type.INTEGER },
            weight: { type: Type.STRING }
          },
          required: ['name', 'sets', 'reps']
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const getAIAdviceWithSearch = async (query: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      systemInstruction: 'คุณคือโค้ชวิ่งมาราธอนระดับโลก ให้คำแนะนำที่เป็นผู้เชี่ยวชาญ สั้นกระชับ เกี่ยวกับท่าวิ่ง การป้องกันการบาดเจ็บ โภชนาการ และความแข็งแกร่งของจิตใจ ใช้โทนเสียงที่ให้กำลังใจแต่เป็นมืออาชีพ **ตอบกลับเป็นภาษาไทยเสมอ** หากผู้ใช้ถามถึงงานวิ่งหรือสภาพอากาศ ให้ใช้ Google Search เพื่อหาข้อมูลที่ทันสมัยที่สุด',
      tools: [{ googleSearch: {} }]
    }
  });

  return {
    text: response.text,
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};
