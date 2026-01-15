# 🚀 Getting Started with the Audiobook Player

Welcome! This guide will help you get the audiobook player running on your computer, even if you're new to programming.

## 📋 What You Need

### No Installation Required!
The easiest way to use this app is to simply open the `index.html` file in your web browser. That's it!

### For Development (Optional)
If you want to use the development server with auto-reload:
- **Node.js**: Download from [nodejs.org](https://nodejs.org/) - Choose the LTS version
- **npm**: Comes automatically with Node.js

## Installation Steps

1. **Clone the Repository**: Start by cloning the repository to your local machine. Open your terminal and run:

   ```
   git clone <repository-url>
   ```

   Replace `<repository-url>` with the URL of the repository.

2. **Navigate to the Project Directory**: Change into the project directory:

   ```
   cd audiobook-player
   ```

3. **Install Dependencies**: Run the following command to install the required npm packages:

   ```
   npm install
   ```

4. **Set Up the Text-to-Speech API**: Follow the instructions in the `docs/api-setup.md` file to configure the text-to-speech API. You will need to obtain an API key and set it up in your environment.

5. **Run the Application**: You can start the application by opening the `index.html` file in your web browser. Alternatively, you can set up a local server using a tool like `live-server` or `http-server` for a better experience.

6. **Upload PDF Files**: Use the interface to upload your PDF files. The application will extract the text and convert it into audio format.

7. **Play Your Audiobooks**: Once the conversion is complete, you can play your audiobooks using the built-in audio player.

## Additional Resources

- For detailed information on how the files interact within the project, refer to the `docs/file-interactions.md` file.
- If you encounter any issues or have questions, please check the `README.md` file for troubleshooting tips and further documentation links.

Happy listening!