import React from "react";

import {
  Grid2x2,
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
    label: "All",
    value: "All",
    icon: Grid2x2,
  },
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

const CategoryFilter = ({
  selected,
  onSelect,
}) => {
  return (
    <div className="mb-6">

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">

        {categories.map((category) => {

          const Icon = category.icon;

          const active =
            selected === category.value;

          return (
            <button
              key={category.value}
              type="button"
              onClick={() =>
                onSelect(category.value)
              }
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-full border transition

              ${
                active
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-blue-50"
              }`}
            >
              <Icon size={18} />

              <span className="text-sm font-medium whitespace-nowrap">
                {category.label}
              </span>

            </button>
          );

        })}

      </div>

    </div>
  );
};

export default CategoryFilter;