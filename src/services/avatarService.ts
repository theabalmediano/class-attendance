const normalizeGender = (gender?: string) => gender?.trim().toLowerCase() || '';

export const getStudentAvatar = (name: string, gender?: string) => {
  const safeName = (name || 'student').trim() || 'student';
  const normalizedGender = normalizeGender(gender);
  const top = normalizedGender === 'female'
    ? 'longHairStraight'
    : normalizedGender === 'male'
      ? 'shortHairShortFlat'
      : 'shortHairShortRound';

  return `https://api.dicebear.com/10.x/avataaars/svg?seed=${encodeURIComponent(safeName)}&top=${top}&backgroundColor=1d4ed8,3b82f6,10b981`;
};
