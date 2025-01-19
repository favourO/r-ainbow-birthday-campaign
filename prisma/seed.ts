import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1) Create some products
  const productData = [
    { name: 'Chocolate Cake', price: 9.99, imageUrl: 'https://media.istockphoto.com/id/1227551348/photo/homemade-triple-layer-chocolate-cake.jpg?s=1024x1024&w=is&k=20&c=HhkiVJmijU5WYwu56R1FhXP5AcfSZUWtoAd9LzO0lyE=' },
    { name: 'Vegan Burger', price: 12.49, imageUrl: 'https://media.istockphoto.com/id/1183008025/photo/healthy-veggie-burger.jpg?s=1024x1024&w=is&k=20&c=fFpoEQXm-B9cXhgXMfrwcUMcUHUNnwgmvWTLPmTGFo4='  },
    { name: 'Pizza', price: 14.99, imageUrl: 'https://media.istockphoto.com/id/184969517/photo/marinara-pizza.jpg?s=1024x1024&w=is&k=20&c=G7fZ_dkANwUUKWxKnmB6SBp6MlvEwmLJfNIopKgblRY='  },
    { name: 'Sushi Platter', price: 19.99, imageUrl: 'https://media.istockphoto.com/id/1078669502/photo/homemade-huge-sushi-platter.jpg?s=1024x1024&w=is&k=20&c=WGcvRPYtA8EBg1lnzAR79wEcsBbYloD1Kar4TLbsAMg='  },
  ];
  await prisma.product.createMany({ data: productData });

  // 2) Create some users
  const userFavour = await prisma.user.create({
    data: {
      name: 'Favour',
      email: 'ojiakufavour@gmail.com',
      birthday: new Date('1995-01-20'),
    },
  });
  const userOjiaku = await prisma.user.create({
    data: {
      name: 'Ojiaku',
      email: 'fojiaku9@gmail.com',
      birthday: new Date('1992-02-15'),
    },
  });

  // 3) Favorites
  await prisma.favorite.create({
    data: {
      userId: userFavour.id,
      productId: 1, 
    },
  });
  await prisma.favorite.create({
    data: {
      userId: userOjiaku.id,
      productId: 2,
    },
  });

  // 4) Carts
  await prisma.cartItem.create({
    data: {
      userId: userFavour.id,
      productId: 3, // Pizza
      quantity: 2,
    },
  });
  await prisma.cartItem.create({
    data: {
      userId: userOjiaku.id,
      productId: 4, // Sushi
      quantity: 1,
    },
  });

  // 5) Orders
  const orderFavour = await prisma.order.create({
    data: {
      userId: userFavour.id,
      items: {
        create: [
          { productId: 1, quantity: 1 }, // Chocolate Cake
          { productId: 2, quantity: 2 }, // Vegan Burger
        ],
      },
    },
    include: { items: true },
  });

  console.log('Seed complete. Created products, users, favorites, carts, orders.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
