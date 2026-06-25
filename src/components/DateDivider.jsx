const DateDivider = ({ label }) => {
  return (
    <div className="flex justify-center my-4">
      <span className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-full shadow">
        {label}
      </span>
    </div>
  );
};

export default DateDivider;