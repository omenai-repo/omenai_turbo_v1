//   async function handleSubmit(e: FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setLoading(true);
//     if (Object.values(data).some((value) => value === "")) {
//       setLoading(false);
//       toast.error("Error notification", {
//         description: "Invalid field inputs",
//         style: {
//           background: "red",
//           color: "white",
//         },
//         className: "class",
//       });
//     } else {
//       const filter: ArtworkPriceFilterData = {
//         "pricing.price": +data.price,
//         "pricing.usd_price": +data.usd_price,
//         "pricing.shouldShowPrice": data.shouldShowPrice,
//         "pricing.currency": data.currency,
//       };

//       const update = await updateArtworkPrice(
//         filter,
//         artwork.art_id,
//         csrf || "",
//       );

//       if (!update?.isOk)
//         toast.error("Error notification", {
//           description: update?.message,
//           style: {
//             background: "red",
//             color: "white",
//           },
//           className: "class",
//         });
//       else {
//         toast.success("Operation successful", {
//           description: update.message,
//           style: {
//             background: "green",
//             color: "white",
//           },
//           className: "class",
//         });
//         queryClient.invalidateQueries({ queryKey: ["fetch_artworks_by_id"] });
//         router.replace("/gallery/artworks");
//       }
//       setLoading(false);
//     }
//   }

// const handleChange = async (
//   event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
// ) => {
//   const { name, value } = event.target;
//   setData((prevData) => ({
//     ...prevData,
//     [name]: value,
//   }));

//   if (name === "currency") {
//     setData((prevData) => ({
//       ...prevData,
//       price: "",
//       usd_price: "",
//     }));
//   }

//   if (name === "price") {
//     const conversion_value = await getCurrencyConversion(
//       data.currency.toUpperCase(),
//       +value,
//       csrf || "",
//     );

//     if (!conversion_value?.isOk)
//       toast.error("Error notification", {
//         description: "Unable to retrieve exchange rate value at this time.",
//         style: {
//           background: "red",
//           color: "white",
//         },
//         className: "class",
//       });
//     else {
//       setData((prevData) => ({
//         ...prevData,
//         usd_price: conversion_value.data.toString(),
//       }));
//     }
//   }
// };
