import SwiftUI

public struct CatAdoptionView: View {
    @Environment(\.dismiss) var dismiss
    @State private var selectedBreed: CatBreed = .scottishFold
    @State private var selectedGender: CatGender = .female
    @State private var selectedEyeColor: CatEyeColor = .green
    @State private var selectedCollar: CollarColor = .pink
    @State private var catName: String = ""
    @State private var currentStep: Int = 0 // 0 = Irk, 1 = Detaylar, 2 = İsim

    var onAdopt: (PetCat) -> Void

    public var body: some View {
        ZStack {
            Color(hex: "#0A0A0E")
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Top bar
                HStack {
                    Button(action: {
                        if currentStep > 0 { currentStep -= 1 }
                        else { dismiss() }
                    }) {
                        Image(systemName: currentStep > 0 ? "chevron.left" : "xmark")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.white.opacity(0.7))
                            .frame(width: 36, height: 36)
                            .background(Color.white.opacity(0.1))
                            .clipShape(Circle())
                    }

                    Spacer()

                    // Step indicator
                    HStack(spacing: 6) {
                        ForEach(0..<3) { i in
                            Circle()
                                .fill(i <= currentStep ? Color(hex: "#FF6B9D") : Color.white.opacity(0.2))
                                .frame(width: 8, height: 8)
                        }
                    }

                    Spacer()

                    Color.clear.frame(width: 36, height: 36)
                }
                .padding(.horizontal, 16)
                .padding(.top, 16)

                // Content based on step
                TabView(selection: $currentStep) {
                    breedSelection.tag(0)
                    detailSelection.tag(1)
                    nameEntry.tag(2)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.spring(response: 0.4), value: currentStep)
            }
        }
    }

    // MARK: - Step 1: Irk Seçimi
    private var breedSelection: some View {
        VStack(spacing: 16) {
            Text("Irk Seç")
                .font(.system(size: 24, weight: .black, design: .rounded))
                .foregroundColor(.white)

            Text("Kedine bir ırk seç")
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(.white.opacity(0.5))

            ScrollView(showsIndicators: false) {
                LazyVGrid(columns: [
                    GridItem(.flexible(), spacing: 12),
                    GridItem(.flexible(), spacing: 12)
                ], spacing: 12) {
                    ForEach(CatBreed.allCases) { breed in
                        breedCard(breed)
                    }
                }
                .padding(.horizontal, 16)
            }

            nextButton { currentStep = 1 }
                .padding(.horizontal, 16)
                .padding(.bottom, 30)
        }
        .padding(.top, 12)
    }

    private func breedCard(_ breed: CatBreed) -> some View {
        let isSelected = selectedBreed == breed
        return Button(action: {
            selectedBreed = breed
            HapticManager.shared.playSelection()
        }) {
            VStack(spacing: 6) {
                // Kedi Sprite Görseli
                CatSpriteImageView(breed: breed, animation: .idle, frameIndex: 0)
                    .frame(width: 80, height: 80)

                Text(breed.displayName)
                    .font(.system(size: 13, weight: .bold, design: .rounded))
                    .foregroundColor(.white)

                Text(breed.subtitle)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.white.opacity(0.4))
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(isSelected ? Color(hex: "#FF6B9D").opacity(0.18) : Color(hex: "#16161E"))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .stroke(isSelected ? Color(hex: "#FF6B9D") : Color.white.opacity(0.06), lineWidth: isSelected ? 2 : 1)
                    )
            )
        }
    }

    // MARK: - Step 2: Detaylar (Cinsiyet, Göz, Tasma)
    private var detailSelection: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                // Animated Live Preview
                VStack(spacing: 8) {
                    CatSpriteAnimatedView(breed: selectedBreed, animation: .idle, interval: 0.25)
                        .frame(width: 120, height: 120)

                    Text(selectedBreed.displayName)
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                }
                .padding(.top, 4)

                // Cinsiyet
                sectionTitle("Cinsiyet")
                HStack(spacing: 12) {
                    genderButton(.female)
                    genderButton(.male)
                }
                .padding(.horizontal, 16)

                // Göz Rengi
                sectionTitle("Göz Rengi")
                HStack(spacing: 10) {
                    ForEach(CatEyeColor.allCases, id: \.self) { color in
                        colorDot(hex: color.hex, selected: selectedEyeColor == color) {
                            selectedEyeColor = color
                        }
                    }
                }
                .padding(.horizontal, 16)

                // Tasma Rengi
                sectionTitle("Tasma Rengi")
                HStack(spacing: 10) {
                    ForEach(CollarColor.allCases, id: \.self) { color in
                        colorDot(hex: color.hex, selected: selectedCollar == color) {
                            selectedCollar = color
                        }
                    }
                }
                .padding(.horizontal, 16)

                nextButton { currentStep = 2 }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 30)
            }
        }
    }

    private func genderButton(_ gender: CatGender) -> some View {
        let isSelected = selectedGender == gender
        return Button(action: {
            selectedGender = gender
            HapticManager.shared.playSelection()
        }) {
            HStack(spacing: 8) {
                Text(gender.symbol)
                    .font(.system(size: 20, weight: .bold))
                Text(gender.displayName)
                    .font(.system(size: 14, weight: .bold, design: .rounded))
            }
            .foregroundColor(isSelected ? .white : .white.opacity(0.5))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(isSelected ? Color(hex: gender == .female ? "#FF6B9D" : "#4FC3F7").opacity(0.2) : Color(hex: "#16161E"))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(isSelected ? Color(hex: gender == .female ? "#FF6B9D" : "#4FC3F7") : Color.clear, lineWidth: 1.5)
                    )
            )
        }
    }

    private func colorDot(hex: String, selected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: {
            action()
            HapticManager.shared.playSelection()
        }) {
            Circle()
                .fill(Color(hex: hex))
                .frame(width: 36, height: 36)
                .overlay(
                    Circle()
                        .stroke(selected ? Color.white : Color.clear, lineWidth: 3)
                )
                .overlay(
                    Circle()
                        .stroke(Color.black.opacity(0.3), lineWidth: 1)
                )
                .scaleEffect(selected ? 1.15 : 1.0)
                .animation(.spring(response: 0.3), value: selected)
        }
    }

    // MARK: - Step 3: İsim Girişi
    private var nameEntry: some View {
        VStack(spacing: 20) {
            Spacer()

            CatSpriteAnimatedView(breed: selectedBreed, animation: .happy, interval: 0.25)
                .frame(width: 140, height: 140)

            Text("Kedine Bir İsim Ver")
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundColor(.white)

            TextField("", text: $catName, prompt: Text("ör: Pamuk, Minnoş, Duman...").foregroundColor(.white.opacity(0.3)))
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)
                .padding(.vertical, 16)
                .background(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(Color(hex: "#16161E"))
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .stroke(Color(hex: "#FF6B9D").opacity(0.3), lineWidth: 1)
                        )
                )
                .padding(.horizontal, 40)

            Button(action: adoptCat) {
                HStack(spacing: 8) {
                    Image(systemName: "pawprint.fill")
                    Text("Sahiplen")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    LinearGradient(
                        colors: [Color(hex: "#FF6B9D"), Color(hex: "#C44569")],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .shadow(color: Color(hex: "#FF6B9D").opacity(0.4), radius: 12, y: 6)
            }
            .disabled(catName.trimmingCharacters(in: .whitespaces).isEmpty)
            .opacity(catName.trimmingCharacters(in: .whitespaces).isEmpty ? 0.5 : 1)
            .padding(.horizontal, 40)

            Spacer()
        }
    }

    // MARK: - Helpers
    private func sectionTitle(_ text: String) -> some View {
        HStack {
            Text(text)
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundColor(.white.opacity(0.6))
            Spacer()
        }
        .padding(.horizontal, 16)
    }

    private func nextButton(action: @escaping () -> Void) -> some View {
        Button(action: {
            action()
            HapticManager.shared.playSelection()
        }) {
            Text("Devam")
                .font(.system(size: 16, weight: .bold, design: .rounded))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(
                    LinearGradient(
                        colors: [Color(hex: "#FF6B9D"), Color(hex: "#C44569")],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        }
    }

    private func adoptCat() {
        let name = catName.trimmingCharacters(in: .whitespaces)
        guard !name.isEmpty else { return }
        let newCat = PetCat(
            name: name,
            breed: selectedBreed,
            gender: selectedGender,
            eyeColor: selectedEyeColor,
            collarColor: selectedCollar,
            ownerId: ""
        )
        onAdopt(newCat)
        HapticManager.shared.playSuccess()
        dismiss()
    }
}
