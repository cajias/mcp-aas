import * as cdk from 'aws-cdk-lib';
const app = new cdk.App(); 
console.log('Available stacks:', app.node.children.map((child: any) => child.node.id));
