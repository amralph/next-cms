import { getUserSession } from '@/lib/getUserSession';
import React from 'react';

const Workspaces = async () => {
  console.log(await getUserSession());
  return <div>page</div>;
};

export default Workspaces;
