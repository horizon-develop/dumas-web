import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductFilters } from "../../features/product/hooks/useProductFilters";
import { getAllCategories } from "../../features/category/api/categoryApi";
import type { CategoryResponse } from "../../features/category/types/categoryDto";

const FEATURED_CATEGORIES: Record<string, { image: string; alt: string }> = {
	ALIMENTOS: {
		image: "/assets/Categories/alimentos.webp",
		alt: "Categoría de alimentos",
	},
	FÁRMACOS: {
		image: "/assets/Categories/farmacos.webp",
		alt: "Categoría de fármacos",
	},
	ACCESORIOS: {
		image: "/assets/Categories/accesorios.webp",
		alt: "Categoría de accesorios",
	},
	SANEAMIENTO: {
		image: "/assets/Categories/saneamiento.webp",
		alt: "Categoría de saneamiento",
	},
};

const CATEGORY_ORDER = ["ALIMENTOS", "FÁRMACOS", "ACCESORIOS", "SANEAMIENTO"];

interface FeaturedCategory {
	id: number;
	name: string;
	image: string;
	alt: string;
}

const CategorySection: React.FC = () => {
	const navigate = useNavigate();
	const { clearFilters } = useProductFilters();
	const [categories, setCategories] = useState<FeaturedCategory[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const allCategories = await getAllCategories();
				const featured = CATEGORY_ORDER.map((name) => {
					const category = allCategories.find(
						(c: CategoryResponse) => c.name.toUpperCase() === name
					);
					if (category) {
						return {
							id: category.id,
							name: category.name.toUpperCase(),
							...FEATURED_CATEGORIES[name],
						};
					}
					return null;
				}).filter((c): c is FeaturedCategory => c !== null);

				setCategories(featured);
			} catch (error) {
			} finally {
				setIsLoading(false);
			}
		};

		fetchCategories();
	}, []);



	const handleCategoryClick = (category: FeaturedCategory) => {
		clearFilters();
		navigate("/shop", { state: { categoryId: category.id } });
	};

	if (isLoading) {
		return (
			<section className="py-10 bg-gray-50">
				<div className="mx-auto max-w-screen-xl px-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 md:-mt-24">
						{[...Array(4)].map((_, i) => (
							<div
								key={i}
								className="h-44 sm:h-52 lg:h-72 w-full rounded-xl bg-gray-200 animate-pulse"
							/>
						))}
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="py-10 bg-gray-50">
			<div className="mx-auto max-w-screen-xl px-4">
				{/* Contenedor grid para mobile y desktop */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 md:-mt-24">
					{categories.map((category) => (
						<button
							key={category.name}
							type="button"
							onClick={() => handleCategoryClick(category)}
							className={`
								group relative h-44 sm:h-52 lg:h-72 w-full
								overflow-hidden shadow-lg
								transition-transform duration-300
								rounded-xl
								lg:hover:scale-[1.02]
								active:scale-95
							`}
							style={{
								border: "4px solid #FF0000",
								boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.15)",
							}}
						>
							<div className="absolute inset-0">
								<img
									src={category.image}
									alt={category.alt}
									className="w-full h-full object-cover object-center"
									loading="lazy"
								/>
							</div>

							<div className="absolute bottom-0 left-0 right-0 text-center py-3 bg-gradient-to-t from-black/70 to-transparent">
								<span className="text-xl font-bold text-white drop-shadow-md">
									{category.name}
								</span>
							</div>
						</button>
					))}
				</div>

				{/* Texto promocional ajustado */}
				<div className="mt-8 text-center">
					<h2 className="text-2xl font-bold text-[#8B0000] mb-3 px-2 md:text-4xl">
						Especialistas en Suministros Profesionales
					</h2>
					<p className="text-gray-600 text-base md:text-xl max-w-xl mx-auto px-2">
						Productos de alta calidad para el cuidado animal especializado
					</p>
				</div>
			</div>
		</section>
	);
};

export default CategorySection;
