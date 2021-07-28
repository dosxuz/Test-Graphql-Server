const express = require('express')
const { graphqlHTTP } = require('express-graphql');

const {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLNonNull
} = require('graphql')

const app = express()

const authors = [
	{ id: 1, name: 'JK Rowling' },
	{ id: 2, name: 'J.R.R Tokein' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Philosopher’s Stone', authorid: 1, publisherid: 1 },
	{ id: 2, name: 'Harry Potter and the Chamber of Secrets', authorid: 1, publisherid: 3 },
	{ id: 3, name: 'Harry Potter and the Prisoner of Azkaban', authorid: 1, publisherid: 2 },
	{ id: 4, name: 'A Middle English Vocabular', authorid: 2, publisherid: 4 },
	{ id: 5, name: 'Sir Gawain & The Green Knight', authorid: 2, publisherid: 1 },
	{ id: 6, name: 'The Hobbit: or There and Back Again', authorid: 2, publisherid: 3 },
	{ id: 7, name: 'The Burning White', authorid: 3, publisherid: 2 },
	{ id: 8, name: 'Way of Shadows', authorid: 3, publisherid: 1 }
]

const publishers = [
	{ id: 1, name: 'Penguin' },
	{ id: 2, name: 'Pearson' },
	{ id: 3, name: 'Thomson Reuters' },
	{ id: 4, name: 'Harper Collins' }
]

const PublisherType = new GraphQLObjectType({
	name: 'Publisher',
	description: 'This represents a publisher of a book',
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt) },
		name: { type: GraphQLNonNull(GraphQLString) },
		book: {
			type: BookType,
			resolve: (publisher) => {
				return books.find(book => book.publisherid == publisher.id)
			}
		}
	})
})

const BookType = new GraphQLObjectType({
	name: 'Book',
	description: 'This represents a book written by an author',
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt) },
		name: { type: GraphQLNonNull(GraphQLString) },
		authorId: { type: GraphQLNonNull(GraphQLInt) },
		publisherid: { type: GraphQLNonNull(GraphQLInt)},
		author: {
			type: AuthorType,
			resolve: (book) => {
				return authors.find(author => author.id == book.authorid)
			}
		},
		publisher: {
			type: PublisherType,
			resolve: (book) => {
				return publishers.find(publisher => publisher.id == book.publisherid)
			}
		}
	})
})


const AuthorType = new GraphQLObjectType({
	name: 'Author',
	description: 'This represents an author of a book',
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt) },
		name: { type: GraphQLNonNull(GraphQLString) },
		books: { 
			type: new GraphQLList(BookType),
			resolve: (author) => {
				return books.filter(book => books.id == authors.id)
			}
		}
	})
})

const RootQueryType = new GraphQLObjectType ({
	name: 'Query',
	description: 'Root Query',
	fields: () => ({
		book: {
			type: BookType,
			description: 'A single book',
			args: {
				id: { type: GraphQLInt }
			},
			resolve: (parent, args) => books.find(book => book.id == args.id)
		},
		books: {
			type: new GraphQLList(BookType),
			description: 'List of Books',
			resolve: () => books
		},
		authors: {
			type: GraphQLList(AuthorType),
			description: 'List of all Authors',
			resolve: () => authors
		},

		author: {
			type: AuthorType,
			description: 'A single author',
			args: {
				id: { type: GraphQLInt }
			},
			resolve: (parent, args) => authors.find(author => author.id === args.id)
		},
		publishers: {
			type: GraphQLList(PublisherType),
			description: 'List of all Publishers',
			resolve: () => publishers
		}
	})
})

const RootMutationType = new GraphQLObjectType ({
	name: 'Mutation',
	description: 'Root Mutation',
	fields: () => ({
		addBook: {
			type: BookType,
			description: 'Add a book',
			args: { 
				name: { type: GraphQLNonNull(GraphQLString) },
				authorid: { type: GraphQLNonNull(GraphQLInt) }
			},
			resolve: (parent, args) => {
				const book = { id: books.length + 1, name: args.name, authorid: args.authorid }
				books.push(book)
				return book
			}
		},

		addAuthor: {
			type: AuthorType,
			description: 'Add an author',
			args: { 
				name: { type: GraphQLNonNull(GraphQLString) }
			},
			resolve: (parent, args) => {
				const author = { id: authors.length + 1, name: args.name }
				authors.push(author)
				return author
			}
		}

	})
})

const schema = new GraphQLSchema ({
	query: RootQueryType,
	mutation: RootMutationType
})


app.use('/graphql', graphqlHTTP({
	schema: schema,
	graphiql: true
}))

app.listen(5000., () => console.log('Server Running'))

