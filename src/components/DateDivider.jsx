export default function DateDivider({ date }) {
  return (
    <div className="flex justify-center my-4">
      <span
        className="
          bg-gray-300
          text-gray-800
          text-xs
          font-medium
          px-3
          py-1
          rounded-full
          shadow
        "
      >
        {date}
      </span>
    </div>
  );
}