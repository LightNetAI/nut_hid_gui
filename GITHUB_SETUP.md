# GitHub Setup Instructions

## ✅ Repository is Ready!

Your NUT HID GUI project has been initialized and committed. Follow these steps to push it to GitHub.

---

## Step 1: Create GitHub Repository

### Option A: Via GitHub Website (Recommended)

1. Go to https://github.com/new
2. **Repository name**: `nut_hid_gui`
3. **Description**: "Modern GUI for NUT HID - Configure network UPS as virtual USB HID device on Windows"
4. **Visibility**: Choose Public (recommended) or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

### Option B: Via GitHub CLI

```bash
# Install GitHub CLI if not installed
winget install GitHub.cli

# Login to GitHub
gh auth login

# Create repository
gh repo create nut_hid_gui --public --source=. --remote=origin --push
```

---

## Step 2: Push to GitHub

After creating the repository on GitHub, you'll see setup instructions. Use these commands:

```bash
# Navigate to project directory
cd /home/ics/nut_hid_gui

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/nut_hid_gui.git

# Verify remote
git remote -v

# Push to GitHub
git push -u origin main
```

### If you get authentication errors:

**Option 1: Use GitHub Token (Recommended)**
```bash
# When prompted for password, use your Personal Access Token
# Generate token at: https://github.com/settings/tokens
# Token needs: repo scope
git push -u origin main
```

**Option 2: Use SSH (if you have SSH keys set up)**
```bash
# Change remote to SSH
git remote set-url origin git@github.com:YOUR_USERNAME/nut_hid_gui.git

# Push
git push -u origin main
```

---

## Step 3: Verify Upload

1. Refresh your GitHub repository page
2. You should see all files:
   - `src/` directory with Rust code
   - `css/`, `js/` directories
   - `index.html`, `Cargo.toml`, etc.
   - All documentation files

---

## Step 4: Add Repository Badges

Update your README.md with your actual GitHub username:

1. Edit `README.md`
2. Replace `YOUR_USERNAME` with your GitHub username in these lines:
   - Issues link
   - Discussions link
   - Support section

Example:
```markdown
- **Issues**: [GitHub Issues](https://github.com/johndoe/nut_hid_gui/issues)
```

---

## Step 5: Optional Enhancements

### Add Repository Topics

On your GitHub repository page:
1. Click the gear icon ⚙️ near "About"
2. Add topics:
   - `rust`
   - `tauri`
   - `ups`
   - `nut`
   - `windows`
   - `hid`
   - `gui`
   - `power-management`

### Enable GitHub Actions (CI/CD)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  CARGO_TERM_COLOR: always

jobs:
  build:
    runs-on: windows-latest

    steps:
    - uses: actions/checkout@v4
    
    - name: Install Rust
      uses: dtolnay/rust-action@stable
      with:
        toolchain: nightly
    
    - name: Install Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    
    - name: Build
      run: cargo build --verbose
    
    - name: Run tests
      run: cargo test --verbose
```

### Add Release Configuration

Create `.github/workflows/release.yml` for automated releases.

---

## Step 6: Share Your Project

Once pushed, you can:

1. **Share the link**: `https://github.com/YOUR_USERNAME/nut_hid_gui`
2. **Post to communities**:
   - r/rust on Reddit
   - NUT mailing list
   - Tauri Discord
   - Windows developer forums
3. **Create a release** with pre-built installer
4. **Add to awesome lists**:
   - awesome-rust
   - awesome-tauri
   - awesome-windows

---

## Quick Reference Commands

```bash
# Check status
git status

# View commit history
git log --oneline

# Add new changes
git add .
git commit -m "Description of changes"

# Push updates
git push

# Pull latest changes (if working with others)
git pull origin main

# Create a new branch
git checkout -b feature/new-feature

# Merge a branch
git checkout main
git merge feature/new-feature
```

---

## Troubleshooting

### "remote: Repository not found"
- Double-check repository name and username in the remote URL
- Ensure repository was created on GitHub

### "Permission denied (publickey)"
- Use HTTPS instead of SSH, or
- Set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### "Updates were rejected because the remote contains work you do not have"
```bash
# Pull remote changes first
git pull origin main --rebase
git push
```

### "fatal: remote origin already exists"
```bash
# Remove and re-add
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/nut_hid_gui.git
```

---

## Next Steps After Pushing

1. ✅ Create first release with build instructions
2. ✅ Add screenshot to `docs/screenshot.png`
3. ✅ Pin repository to your GitHub profile
4. ✅ Share on social media / developer communities
5. ✅ Monitor issues and discussions

---

**🎉 Congratulations!** Your NUT HID GUI project is now on GitHub!

For questions or issues, refer to:
- [GitHub Docs](https://docs.github.com/)
- [Git Documentation](https://git-scm.com/doc)
- Project's own INTEGRATION_GUIDE.md
