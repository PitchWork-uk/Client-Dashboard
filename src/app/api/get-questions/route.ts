import { NextRequest, NextResponse } from "next/server";
import { getQuestionsByTaskType } from "@/lib/notion";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskType = searchParams.get("taskType");

    if (!taskType) {
      return NextResponse.json(
        {
          error: "Task type is required",
        },
        { status: 400 }
      );
    }

    const questionnaireDatabaseId =
      process.env.NOTION_DATABASE_QUESTIONNAIRE_ID;
    if (!questionnaireDatabaseId) {
      return NextResponse.json(
        {
          error: "Questionnaire database ID not configured",
        },
        { status: 500 }
      );
    }

    const questions = await getQuestionsByTaskType(
      questionnaireDatabaseId,
      taskType
    );

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error in get-questions API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
