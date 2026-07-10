import React from "react";

import {
  Smartphone,
  Laptop,
  Shirt,
  Home,
  Sofa,
  Car,
  Building2,
  Briefcase,
  Wrench,
  Dumbbell,
  BookOpen,
  Dog,
  Utensils,
  Package,
} from "lucide-react";

const categories = [
  {
    label: "Phones",
    value: "Phones",
    icon: Smartphone,
  },
  {
    label: "Electronics",
    value: "Electronics",
    icon: Laptop,
  },
  {
    label: "Fashion",
    value: "Fashion",
    icon: Shirt,
  },
  {
    label: "Home",
    value: "Home",
    icon: Home,
  },
  {
    label: "Furniture",
    value: "Furniture",
    icon: Sofa,
  },
  {
    label: "Vehicles",
    value: "Vehicles",
    icon: Car,
  },
  {
    label: "Property",
    value: "Property",
    icon: Building2,
  },
  {
    label: "Jobs",
    value: "Jobs",
    icon: Briefcase,
  },
  {
    label: "Services",
    value: "Services",
    icon: Wrench,
  },
  {
    label: "Sports",
    value: "Sports",
    icon: Dumbbell,
  },
  {
    label: "Books",
    value: "Books",
    icon: BookOpen,
  },
  {
    label: "Pets",
    value: "Pets",
    icon: Dog,
  },
  {
    label: "Food",
    value: "Food",
    icon: Utensils,
  },
  {
    label: "Others",
    value: "Others",
    icon: Package,
  },
];

const CategorySelect = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-3">

      <label className="block font-semibold text-gray-700">
        Category
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

        {categories.map((category) => {
          const Icon = category.icon;

          const selected =
            value === category.value;

          return (
            <button
              key={category.value}
              type="button"
              onClick={() =>
                onChange(category.value)
              }
              className={`rounded-xl border p-4 transition flex flex-col items-center gap-2

              ${
                selected
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-blue-50"
              }`}
            >
              <Icon size={28} />

              <span className="text-sm font-medium">
                {category.label}
              </span>
            </button>
          );
        })}

      </div>
    </div>
  );
};

export default CategorySelect;