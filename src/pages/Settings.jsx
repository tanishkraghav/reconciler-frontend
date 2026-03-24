import Layout from "../components/layout/Layout";

export default function Settings() {
  return (
    <Layout>

      <h1>Settings</h1>

      <input placeholder="Name" />
      <input placeholder="Email" />

      <select>
        <option>USD</option>
        <option>INR</option>
      </select>

    </Layout>
  );
}