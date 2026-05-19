export const calculatePoints = ({
  views = 0,
  likes = 0,
  referral= 0,
 leaderboard=0,
}) => {
  return (
    views * 1 +
    likes * 2 +
    referral* 3 +
    leaderboard * 3 +
    
    
  );
};