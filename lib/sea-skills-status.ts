export type SeaSkillsStatus = 'pending' | 'finished';

export type SeaSkillsActivity = {
  activity_id: number;
  week_number: number;
  code: string;
  title: string;
  completed_at: string | null;
  minutes_spent: number | null;
  auto_completed: number | boolean | null;
  status: SeaSkillsStatus;
};

export type SeaSkillsStatusResponse = {
  user: {
    id: number;
    name: string;
    email: string;
  };
  activities: SeaSkillsActivity[];
};

const API_BASE = 'https://www.wartimemaritime.org/api';

export async function fetchSeaSkillsStatus(input: {
  userId: number;
  token: string;
}): Promise<SeaSkillsStatusResponse> {
  const response = await fetch(`${API_BASE}/sea-skills/status/${input.userId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${input.token}`,
    },
  });

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as { message?: unknown }).message === 'string'
        ? (data as { message: string }).message
        : `Unable to load lesson status (${response.status})`;

    throw new Error(message);
  }

  if (
    typeof data !== 'object' ||
    data === null ||
    !('activities' in data) ||
    !Array.isArray((data as { activities?: unknown }).activities)
  ) {
    throw new Error('Unexpected lesson status response from server.');
  }

  return data as SeaSkillsStatusResponse;
}
