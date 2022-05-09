const nature = () => {
  console.log('...');
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('恐龙');
    }, 2000);
  });
};

const demo = async () => {
  const data = await nature();
  console.log(data);
};
demo();

console.log('火山');
