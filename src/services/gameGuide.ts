import { invoke } from "@tauri-apps/api/core";

export type GuideMessage = {
  role: "user" | "assistant";
  text: string;
};

export type AskGameGuideRequest = {
  gameTitle: string;
  question: string;
  recentConversation: GuideMessage[];
};

export type AskGameGuideResponse = {
  answer: string;
};

export async function askGameGuide(
  request: AskGameGuideRequest,
): Promise<AskGameGuideResponse> {
  return invoke<AskGameGuideResponse>("ask_game_guide", {
    gameTitle: request.gameTitle,
    question: request.question,
    recentConversation: request.recentConversation,
  });
}

export function getSuggestedQuestions(gameTitle: string): string[] {
  const title = gameTitle.trim();
  const normalized = title.toLowerCase();

  if (normalized.includes("sekiro")) {
    return [
      "How do I defeat the chained ogre?",
      "Where can I find Divine Confetti?",
      "How does posture work?",
      "What should I do next?",
    ];
  }

  if (normalized.includes("elden") || normalized.includes("ring") || normalized.includes("souls")) {
    return [
      "What should I do first?",
      "Where should I go next?",
      "How do I prepare for bosses?",
      "Which mechanics should I understand?",
    ];
  }

  if (normalized.includes("zelda") || normalized.includes("botw") || normalized.includes("hyrule")) {
    return [
      "What should I explore first?",
      "How do I progress through the world?",
      "Which items should I prioritize?",
      "What is the best next objective?",
    ];
  }

  return [
    "What should I do first?",
    "How do I progress from here?",
    "Which mechanics should I understand?",
    "What is the best next objective?",
  ];
}
