import SwiftUI
import AVFoundation

struct ContentView: View {
    let synthesizer = AVSpeechSynthesizer()

    let bunkei = [
        "わたしは マイク・ミラーです。",
        "サントスさんは 学生じゃ ありません。",
        "ミラーさんは 会社員ですか。",
        "サントスさんも 会社員です。"
    ]

    let reibun = [
        "［あなたは］マイク・ミラーさんですか。",
        "はい、［わたしは］マイク・ミラーです。",
        "ミラーさんは 学生ですか。",
        "いいえ、［わたしは］学生じゃ ありません。",
        "ワンさんは 銀行員ですか。",
        "いいえ、［ワンさんは］銀行員じゃ ありません。 医者です。",
        "あの 方は どなたですか。",
        "ワットさんです。 さくら大学の 先生です。",
        "グプタさんは 会社員ですか。",
        "はい、会社員です。",
        "カリナさんも 会社員ですか。",
        "いいえ、［カリナさんは］学生です。",
        "テレーザちゃんは 何歳ですか。",
        "9歳です。"
    ]

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {

                    Text("第1課")
                        .font(.largeTitle)
                        .bold()
                        .frame(maxWidth: .infinity, alignment: .center)

                    lessonSection(title: "文型", lines: bunkei)
                    lessonSection(title: "例文", lines: reibun)
                }
                .padding()
            }
            .navigationTitle("日语点读")
        }
    }

    func lessonSection(title: String, lines: [String]) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(.title2)
                .bold()

            ForEach(Array(lines.enumerated()), id: \.offset) { index, line in
                HStack(alignment: .top, spacing: 12) {
                    Text("\(index + 1).")
                        .bold()
                        .frame(width: 30, alignment: .leading)

                    Text(line)
                        .font(.title3)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    Button(action: {
                        speakJapanese(text: line)
                    }) {
                        Image(systemName: "speaker.wave.2.fill")
                            .font(.title2)
                            .foregroundColor(.white)
                            .padding(10)
                            .background(Color.blue)
                            .clipShape(Circle())
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(16)
            }
        }
    }

    func speakJapanese(text: String) {
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "ja-JP")
        utterance.rate = 0.45
        utterance.pitchMultiplier = 1.0
        synthesizer.speak(utterance)
    }
}

#Preview {
    ContentView()
}
