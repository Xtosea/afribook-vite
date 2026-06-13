export const calculatePoints = ({
  views = 0,
  likes = 0,
  reactions = 0,
  replies = 0,
  shares = 0,
}) => {
  return (
    views * 1 +
    likes * 2 +
    reactions * 2 +
    replies * 3 +
    shares * 5
  );
};
