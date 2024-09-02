import { Directive, Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Directive('@key(fields:"id")')
export class avatars {
  @Field()
  id: string;

  @Field()
  public_id: string;
  @Field()
  url: string;
  @Field()
  userId: string;
}

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  phone_number: string;

  @Field()
  address: string;

  @Field()
  password: string;

  @Field()
  role: string;
  @Field(() => avatars, { nullable: true })
  avatar?: avatars | null;
  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
