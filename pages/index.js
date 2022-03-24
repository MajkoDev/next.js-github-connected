import Head from "next/head";
import Image from "next/image";

import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  gql,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

import styles from "../styles/Home.module.css";

export default function Home({ pinnedItems }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Github in Next.js</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Github in Next.js</h1>

        <p className={styles.description}>
          How to fetch github repositories for your next.js website
        </p>

        <div className={styles.grid}>
          {pinnedItems.map((item) => {
            return (
              <a key={item.id} href={item.url} className={styles.card}>
                <h2>{item.name} &rarr;</h2>
                <h4 className={styles.date}>Created at {item.createdAt}</h4>
                <h4 className={styles.date}>Updated at {item.updatedAt}</h4>
                <p>{item.description}</p>
              </a>
            );
          })}
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href='https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app'
          target='_blank'
          rel='noopener noreferrer'>
          Powered by{" "}
          <span className={styles.logo}>
            <Image src='/vercel.svg' alt='Vercel Logo' width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}

export async function getStaticProps() {
  const httpLink = createHttpLink({
    uri: "https://api.github.com/graphql",
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
      },
    };
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  const { data } = await client.query({
    query: gql`
      {
        user(login: "MajkoDev") {
          pinnedItems {
            totalCount
            edges {
              node {
                ... on Repository {
                  id
                  name
                  url
                  description
                  createdAt
                  updatedAt
                }
              }
            }
          }
        }
      }
    `,
  });

  const { user } = data;
  const pinnedItems = user.pinnedItems.edges.map((edge) => edge.node);

  return {
    props: {
      pinnedItems,
    },
  };
}
