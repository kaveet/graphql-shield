import test from 'ava'
import { graphql, getIntrospectionQuery } from 'graphql'
import { applyMiddleware } from 'graphql-middleware'
import { makeExecutableSchema } from 'graphql-tools'
import { shield } from '../index'
import { allow, deny } from '../constructors'

test('GraphiQL introspection query works.', async t => {
  // Schema
  const typeDefs = `
    type Query {
      test: String!
      type: TestType!
    }

    type TestType {
      fieldString: String!
      fieldInt: Int!
    }
  `

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers: {},
  })

  // Permissions
  const permissions = shield(
    {},
    {
      fallbackRule: deny,
      graphiql: true,
    },
  )

  const schemaWithPermissions = applyMiddleware(schema, permissions)

  // Execution
  const res = await graphql(schemaWithPermissions, getIntrospectionQuery())

  t.deepEqual(res.errors, undefined)
})

test('GraphiQL normal query works.', async t => {
  // Schema
  const typeDefs = `
    type Query {
      test: String!
    }
  `

  const resolvers = {
    Query: {
      test: () => 'pass',
    },
  }

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })

  // Permissions
  const permissions = shield(
    {
      Query: {
        test: allow,
      },
    },
    {
      whitelist: true,
      graphiql: true,
    },
  )

  const schemaWithPermissions = applyMiddleware(schema, permissions)

  // Execution
  const query = `
    query {
      test
    }
  `
  const res = await graphql(schemaWithPermissions, query)

  t.deepEqual(res.data, {
    test: 'pass',
  })
})

test('GraphiQL introspection query works with fallbackRule set to deny.', async t => {
  // Schema
  const typeDefs = `
    type Query {
      test: String!
      type: TestType!
    }

    type TestType {
      fieldString: String!
      fieldInt: Int!
    }
  `

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers: {},
  })

  // Permissions
  const permissions = shield(
    {},
    {
      whitelist: true,
      graphiql: true,
    },
  )

  const schemaWithPermissions = applyMiddleware(schema, permissions)

  // Execution
  const res = await graphql(schemaWithPermissions, getIntrospectionQuery())

  t.deepEqual(res.errors, undefined)
})

test('GraphiQL normal query works with fallbackRule set to deny.', async t => {
  // Schema
  const typeDefs = `
    type Query {
      test: String!
    }
  `

  const resolvers = {
    Query: {
      test: () => 'pass',
    },
  }

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })

  // Permissions
  const permissions = shield(
    {
      Query: {
        test: allow,
      },
    },
    {
      fallbackRule: deny,
      graphiql: true,
    },
  )

  const schemaWithPermissions = applyMiddleware(schema, permissions)

  // Execution
  const query = `
    query {
      test
    }
  `
  const res = await graphql(schemaWithPermissions, query)

  t.deepEqual(res.data, {
    test: 'pass',
  })
})
