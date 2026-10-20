// REV151: bog'cha darslari uchun rassom chizgan rasmlar (avtomatik ro'yxat). Kalit — «d_» + darsRasmMeta.js dagi id.
import { RASMLAR } from "./xonalar/rasmlar.js";
import { JR } from "./jonli/jonliRasm.js";
import d_apple_please from "./dars/rasm/apple-please.webp";
import d_basket from "./dars/rasm/basket.webp";
import d_bathroom from "./dars/rasm/bathroom.webp";
import d_be_quiet from "./dars/rasm/be-quiet.webp";
import d_bear from "./dars/rasm/bear.webp";
import d_big from "./dars/rasm/big.webp";
import d_black from "./dars/rasm/black.webp";
import d_blue from "./dars/rasm/blue.webp";
import d_brown from "./dars/rasm/brown.webp";
import d_bu_mening_akam_yoki_ukam from "./dars/rasm/bu_mening_akam_yoki_ukam.webp";
import d_bu_mening_dadam from "./dars/rasm/bu_mening_dadam.webp";
import d_bu_mening_onam from "./dars/rasm/bu_mening_onam.webp";
import d_bu_mening_opam_yoki_singlim from "./dars/rasm/bu_mening_opam_yoki_singlim.webp";
import d_can_clap from "./dars/rasm/can-clap.webp";
import d_can_i_help from "./dars/rasm/can-i-help.webp";
import d_can_jump from "./dars/rasm/can-jump.webp";
import d_can_you_swim from "./dars/rasm/can-you-swim.webp";
import d_cant_fly from "./dars/rasm/cant-fly.webp";
import d_clap_your_hands from "./dars/rasm/clap-your-hands.webp";
import d_climb from "./dars/rasm/climb.webp";
import d_close_book from "./dars/rasm/close-book.webp";
import d_crocodile from "./dars/rasm/crocodile.webp";
import d_dislike_onions from "./dars/rasm/dislike-onions.webp";
import d_dislike_rain from "./dars/rasm/dislike-rain.webp";
import d_dislike_spiders from "./dars/rasm/dislike-spiders.webp";
import d_do_you_like from "./dars/rasm/do-you-like.webp";
import d_do_st from "./dars/rasm/do_st.webp";
import d_elephant from "./dars/rasm/elephant.webp";
import d_family from "./dars/rasm/family.webp";
import d_farm from "./dars/rasm/farm.webp";
import d_favourite_colour from "./dars/rasm/favourite-colour.webp";
import d_favourite_plov from "./dars/rasm/favourite-plov.webp";
import d_fish_swim from "./dars/rasm/fish-swim.webp";
import d_five_bananas from "./dars/rasm/five-bananas.webp";
import d_fox from "./dars/rasm/fox.webp";
import d_from_uzbekistan from "./dars/rasm/from-uzbekistan.webp";
import d_futbolkam_qizil from "./dars/rasm/futbolkam_qizil.webp";
import d_garden from "./dars/rasm/garden.webp";
import d_giraffe from "./dars/rasm/giraffe.webp";
import d_go_by_bus from "./dars/rasm/go-by-bus.webp";
import d_goodbye_see_you from "./dars/rasm/goodbye-see-you.webp";
import d_green from "./dars/rasm/green.webp";
import d_grey from "./dars/rasm/grey.webp";
import d_have_ball from "./dars/rasm/have-ball.webp";
import d_have_cat from "./dars/rasm/have-cat.webp";
import d_have_dog from "./dars/rasm/have-dog.webp";
import d_have_sister from "./dars/rasm/have-sister.webp";
import d_he_is_doctor from "./dars/rasm/he-is-doctor.webp";
import d_hello from "./dars/rasm/hello.webp";
import d_help_me from "./dars/rasm/help-me.webp";
import d_here_you_are from "./dars/rasm/here-you-are.webp";
import d_how_are_you from "./dars/rasm/how-are-you.webp";
import d_how_go_school from "./dars/rasm/how-go-school.webp";
import d_how_many from "./dars/rasm/how-many.webp";
import d_how_many_bananas from "./dars/rasm/how-many-bananas.webp";
import d_i_am_big from "./dars/rasm/i-am-big.webp";
import d_i_am_five from "./dars/rasm/i-am-five.webp";
import d_i_like from "./dars/rasm/i-like.webp";
import d_i_walk from "./dars/rasm/i-walk.webp";
import d_im_fine from "./dars/rasm/im-fine.webp";
import d_im_thirsty from "./dars/rasm/im-thirsty.webp";
import d_in_box from "./dars/rasm/in-box.webp";
import d_its_a_ball from "./dars/rasm/its-a-ball.webp";
import d_kitchen from "./dars/rasm/kitchen.webp";
import d_kiy from "./dars/rasm/kiy.webp";
import d_lets_count from "./dars/rasm/lets-count.webp";
import d_lets_play from "./dars/rasm/lets-play.webp";
import d_like_apples from "./dars/rasm/like-apples.webp";
import d_like_cats from "./dars/rasm/like-cats.webp";
import d_like_ice_cream from "./dars/rasm/like-ice-cream.webp";
import d_lion from "./dars/rasm/lion.webp";
import d_living_room from "./dars/rasm/living-room.webp";
import d_love_mum from "./dars/rasm/love-mum.webp";
import d_mening_ismim_anvar from "./dars/rasm/mening_ismim_anvar.webp";
import d_money from "./dars/rasm/money.webp";
import d_monkey from "./dars/rasm/monkey.webp";
import d_my_name_is from "./dars/rasm/my-name-is.webp";
import d_my_name_is_2 from "./dars/rasm/my-name-is_2.webp";
import d_nice_to_meet from "./dars/rasm/nice-to-meet.webp";
import d_no from "./dars/rasm/no.webp";
import d_no_i_cant from "./dars/rasm/no-i-cant.webp";
import d_no_i_dont from "./dars/rasm/no-i-dont.webp";
import d_of_course from "./dars/rasm/of-course.webp";
import d_on_table from "./dars/rasm/on-table.webp";
import d_open_book from "./dars/rasm/open-book.webp";
import d_owl from "./dars/rasm/owl.webp";
import d_pink from "./dars/rasm/pink.webp";
import d_purple from "./dars/rasm/purple.webp";
import d_raise_hand from "./dars/rasm/raise-hand.webp";
import d_red from "./dars/rasm/red.webp";
import d_ride_bike from "./dars/rasm/ride-bike.webp";
import d_school from "./dars/rasm/school.webp";
import d_shapkangni_kiy from "./dars/rasm/shapkangni_kiy.webp";
import d_she_is_teacher from "./dars/rasm/she-is-teacher.webp";
import d_sit_down from "./dars/rasm/sit-down.webp";
import d_skate from "./dars/rasm/skate.webp";
import d_small from "./dars/rasm/small.webp";
import d_snake from "./dars/rasm/snake.webp";
import d_snake_cant_walk from "./dars/rasm/snake-cant-walk.webp";
import d_snowy from "./dars/rasm/snowy.webp";
import d_stamp_your_feet from "./dars/rasm/stamp-your-feet.webp";
import d_stand_up from "./dars/rasm/stand-up.webp";
import d_stop from "./dars/rasm/stop.webp";
import d_thank_you from "./dars/rasm/thank-you.webp";
import d_this_is_my from "./dars/rasm/this-is-my.webp";
import d_tiger from "./dars/rasm/tiger.webp";
import d_today_is from "./dars/rasm/today-is.webp";
import d_tomorrow from "./dars/rasm/tomorrow.webp";
import d_tuflim_ko_k from "./dars/rasm/tuflim_ko_k.webp";
import d_under_bed from "./dars/rasm/under-bed.webp";
import d_want_pilot from "./dars/rasm/want-pilot.webp";
import d_want_to_be from "./dars/rasm/want-to-be.webp";
import d_weather from "./dars/rasm/weather.webp";
import d_week from "./dars/rasm/week.webp";
import d_weekend from "./dars/rasm/weekend.webp";
import d_well_done from "./dars/rasm/well-done.webp";
import d_what_day from "./dars/rasm/what-day.webp";
import d_what_is_it from "./dars/rasm/what-is-it.webp";
import d_what_like from "./dars/rasm/what-like.webp";
import d_whats_your_name from "./dars/rasm/whats-your-name.webp";
import d_where_cat from "./dars/rasm/where-cat.webp";
import d_where_live from "./dars/rasm/where-live.webp";
import d_white from "./dars/rasm/white.webp";
import d_wolf from "./dars/rasm/wolf.webp";
import d_xursand from "./dars/rasm/xursand.webp";
import d_yes from "./dars/rasm/yes.webp";
import d_yes_i_can from "./dars/rasm/yes-i-can.webp";
import d_yes_i_do from "./dars/rasm/yes-i-do.webp";
import d_yummy from "./dars/rasm/yummy.webp";
import d_zebra from "./dars/rasm/zebra.webp";
import d_chest from "./dars/rasm/chest.webp";
import d_eat_fruit from "./dars/rasm/eat-fruit.webp";
import d_i_go_to_bed from "./dars/rasm/i-go-to-bed.webp";
import d_i_m_ready_for_school from "./dars/rasm/i-m-ready-for-school.webp";
import d_i_visited_my_granny from "./dars/rasm/i-visited-my-granny.webp";
import d_it_was_fun from "./dars/rasm/it-was-fun.webp";
import d_look_left_and_right from "./dars/rasm/look-left-and-right.webp";
import d_open_your_mouth from "./dars/rasm/open-your-mouth.webp";
import d_sababi from "./dars/rasm/sababi.webp";
import d_wash_your_hands_2 from "./dars/rasm/wash-your-hands-2.webp";
import d_astronavt from "./dars/rasm/astronavt.webp";
import d_atirgul from "./dars/rasm/atirgul.webp";
import d_axlat_qutisi from "./dars/rasm/axlat-qutisi.webp";
import d_baliqcha from "./dars/rasm/baliqcha.webp";
import d_behind_the_box from "./dars/rasm/behind-the-box.webp";
import d_birinchi from "./dars/rasm/birinchi.webp";
import d_bittani_ayirish from "./dars/rasm/bittani-ayirish.webp";
import d_black_and_white from "./dars/rasm/black-and-white.webp";
import d_burgut from "./dars/rasm/burgut.webp";
import d_buxoro_bug_usi from "./dars/rasm/buxoro-bug-usi.webp";
import d_buxoro from "./dars/rasm/buxoro.webp";
import d_chigirtka from "./dars/rasm/chigirtka.webp";
import d_chorak from "./dars/rasm/chorak.webp";
import d_g_ildirak from "./dars/rasm/g-ildirak.webp";
import d_go_sht from "./dars/rasm/go-sht.webp";
import d_ikkinchi from "./dars/rasm/ikkinchi.webp";
import d_ip_bilan_o_lchash from "./dars/rasm/ip-bilan-o-lchash.webp";
import d_javob from "./dars/rasm/javob.webp";
import d_kit_2 from "./dars/rasm/kit-2.webp";
import d_kit from "./dars/rasm/kit.webp";
import d_kulrang_echkemar from "./dars/rasm/kulrang-echkemar.webp";
import d_kurka from "./dars/rasm/kurka.webp";
import d_magnit from "./dars/rasm/magnit.webp";
import d_metroda from "./dars/rasm/metroda.webp";
import d_mo_yqalam from "./dars/rasm/mo-yqalam.webp";
import d_o_t_o_chirgich from "./dars/rasm/o-t-o-chirgich.webp";
import d_og_ir from "./dars/rasm/og-ir.webp";
import d_plastikni from "./dars/rasm/plastikni.webp";
import d_qo_tos from "./dars/rasm/qo-tos.webp";
import d_qor_qoploni from "./dars/rasm/qor-qoploni.webp";
import d_qovun from "./dars/rasm/qovun.webp";
import d_qushlarga_g_amxo_rlik from "./dars/rasm/qushlarga-g-amxo-rlik.webp";
import d_quyosh_nuri_2 from "./dars/rasm/quyosh-nuri-2.webp";
import d_quyosh_nuri from "./dars/rasm/quyosh-nuri.webp";
import d_rasmli_misol from "./dars/rasm/rasmli-misol.webp";
import d_shaftoli from "./dars/rasm/shaftoli.webp";
import d_soya from "./dars/rasm/soya.webp";
import d_tik_va_qiya_nur from "./dars/rasm/tik-va-qiya-nur.webp";
import d_til from "./dars/rasm/til.webp";
import d_tortiladi from "./dars/rasm/tortiladi.webp";
import d_tozalik from "./dars/rasm/tozalik.webp";
import d_tuman from "./dars/rasm/tuman.webp";
import d_uch from "./dars/rasm/uch.webp";
import d_uchinchi from "./dars/rasm/uchinchi.webp";
import d_urug_2 from "./dars/rasm/urug-2.webp";
import d_uya from "./dars/rasm/uya.webp";
import d_yer_2 from "./dars/rasm/yer-2.webp";
import d_yer from "./dars/rasm/yer.webp";
import d_yerning_qiyaligi from "./dars/rasm/yerning-qiyaligi.webp";
import d_yuk_mashinasi from "./dars/rasm/yuk-mashinasi.webp";
import d_101 from "./dars/rasm/101.webp";
import d_bir_soatda from "./dars/rasm/bir-soatda.webp";
import d_bugun from "./dars/rasm/bugun.webp";
import d_bulg_or_qalampiri from "./dars/rasm/bulg-or-qalampiri.webp";
import d_cheksiz from "./dars/rasm/cheksiz.webp";
import d_dumalaydigan_shakllar from "./dars/rasm/dumalaydigan-shakllar.webp";
import d_elektr from "./dars/rasm/elektr.webp";
import d_foydali_ovqat from "./dars/rasm/foydali-ovqat.webp";
import d_grafik_diktant from "./dars/rasm/grafik-diktant.webp";
import d_ikki_yuz_va_besh_yuz from "./dars/rasm/ikki-yuz-va-besh-yuz.webp";
import d_istirohat_bog_i from "./dars/rasm/istirohat-bog-i.webp";
import d_jun from "./dars/rasm/jun.webp";
import d_ko_zoynak from "./dars/rasm/ko-zoynak.webp";
import d_kompas from "./dars/rasm/kompas.webp";
import d_kuzatish from "./dars/rasm/kuzatish.webp";
import d_misoldan_masala from "./dars/rasm/misoldan-masala.webp";
import d_momaqaldiroq from "./dars/rasm/momaqaldiroq.webp";
import d_nafas_olish_va_chiqarish from "./dars/rasm/nafas-olish-va-chiqarish.webp";
import d_narx from "./dars/rasm/narx.webp";
import d_olti from "./dars/rasm/olti.webp";
import d_oqqush from "./dars/rasm/oqqush.webp";
import d_ovozini_baland_qilamiz from "./dars/rasm/ovozini-baland-qilamiz.webp";
import d_oxirgi from "./dars/rasm/oxirgi.webp";
import d_oy from "./dars/rasm/oy.webp";
import d_oziq_zanjiri from "./dars/rasm/oziq-zanjiri.webp";
import d_pashsha_va_mikroblar from "./dars/rasm/pashsha-va-mikroblar.webp";
import d_pastda from "./dars/rasm/pastda.webp";
import d_pingvin from "./dars/rasm/pingvin.webp";
import d_qadam from "./dars/rasm/qadam.webp";
import d_qator from "./dars/rasm/qator.webp";
import d_qayta_foydalanish_2 from "./dars/rasm/qayta-foydalanish-2.webp";
import d_qayta_ishlash from "./dars/rasm/qayta-ishlash.webp";
import d_qishki_uyqu from "./dars/rasm/qishki-uyqu.webp";
import d_qo_shiq from "./dars/rasm/qo-shiq.webp";
import d_qoldiq from "./dars/rasm/qoldiq.webp";
import d_qon from "./dars/rasm/qon.webp";
import d_qonuniyat from "./dars/rasm/qonuniyat.webp";
import d_qulf from "./dars/rasm/qulf.webp";
import d_qum_ostiga_yashirinadi from "./dars/rasm/qum-ostiga-yashirinadi.webp";
import d_sarg_ayadi from "./dars/rasm/sarg-ayadi.webp";
import d_sayyora from "./dars/rasm/sayyora.webp";
import d_tajriba from "./dars/rasm/tajriba.webp";
import d_temir_mixni from "./dars/rasm/temir-mixni.webp";
import d_to_qqiz from "./dars/rasm/to-qqiz.webp";
import d_yashil_rang from "./dars/rasm/yashil-rang.webp";
import d_yeb_qo_ydi from "./dars/rasm/yeb-qo-ydi.webp";
import d_yog_ochni from "./dars/rasm/yog-ochni.webp";
import d_yulduzli_osmon from "./dars/rasm/yulduzli-osmon.webp";
import d_yuz_so_mlik from "./dars/rasm/yuz-so-mlik.webp";
import d_yuzlab_yil from "./dars/rasm/yuzlab-yil.webp";
import d_cut from "./dars/rasm/cut.webp";
import d_i_get_up from "./dars/rasm/i-get-up.webp";
import d_i_went_to_the_park from "./dars/rasm/i-went-to-the-park.webp";
import d_the_cat_is_sleeping from "./dars/rasm/the-cat-is-sleeping.webp";
import d_what_did_you_do_yesterday from "./dars/rasm/what-did-you-do-yesterday.webp";
import d_what_s_the_matter from "./dars/rasm/what-s-the-matter.webp";
import d_where_is_the_park from "./dars/rasm/where-is-the-park.webp";
import d_1 from "./dars/rasm/1.webp";
import d_2 from "./dars/rasm/2.webp";
import d_6 from "./dars/rasm/6.webp";
import d_7 from "./dars/rasm/7.webp";
import d_akula from "./dars/rasm/akula.webp";
import d_bitta from "./dars/rasm/bitta.webp";
import d_burger from "./dars/rasm/burger.webp";
import d_diqqat from "./dars/rasm/diqqat.webp";
import d_do_konga_boramiz from "./dars/rasm/do-konga-boramiz.webp";
import d_dubulg_a from "./dars/rasm/dubulg-a.webp";
import d_hayvonlar_ovqatsiz_qoladi from "./dars/rasm/hayvonlar-ovqatsiz-qoladi.webp";
import d_hech_narsa_bo_lmaydi from "./dars/rasm/hech-narsa-bo-lmaydi.webp";
import d_ildiz_chiriydi from "./dars/rasm/ildiz-chiriydi.webp";
import d_juda_baland_ovozdan_saqlaymiz from "./dars/rasm/juda-baland-ovozdan-saqlaymiz.webp";
import d_kalit from "./dars/rasm/kalit.webp";
import d_kattalarni_chaqiramiz from "./dars/rasm/kattalarni-chaqiramiz.webp";
import d_ko_p_chips from "./dars/rasm/ko-p-chips.webp";
import d_ko_p_qavatli_uy from "./dars/rasm/ko-p-qavatli-uy.webp";
import d_kunduzi from "./dars/rasm/kunduzi.webp";
import d_mushtdek from "./dars/rasm/mushtdek.webp";
import d_ovlaymiz from "./dars/rasm/ovlaymiz.webp";
import d_qisqa_3 from "./dars/rasm/qisqa-3.webp";
import d_qo_rqitamiz from "./dars/rasm/qo-rqitamiz.webp";
import d_quvurlar_orqali from "./dars/rasm/quvurlar-orqali.webp";
import d_rasmga_olish from "./dars/rasm/rasmga-olish.webp";
import d_samokat from "./dars/rasm/samokat.webp";
import d_se from "./dars/rasm/se.webp";
import d_sinadi_yoki_to_kiladi from "./dars/rasm/sinadi-yoki-to-kiladi.webp";
import d_suv_qahramoni from "./dars/rasm/suv-qahramoni.webp";
import d_suzdi from "./dars/rasm/suzdi.webp";
import d_tepalik_ustida from "./dars/rasm/tepalik-ustida.webp";
import d_to_kib_yuboramiz from "./dars/rasm/to-kib-yuboramiz.webp";
import d_to_ntaramiz from "./dars/rasm/to-ntaramiz.webp";
import d_tuk_tuk from "./dars/rasm/tuk-tuk.webp";
import d_tuzdan from "./dars/rasm/tuzdan.webp";
import d_u1f314 from "./dars/rasm/u1f314.webp";
import d_u1f376 from "./dars/rasm/u1f376.webp";
import d_u1f48e from "./dars/rasm/u1f48e.webp";
import d_u1f54a from "./dars/rasm/u1f54a.webp";
import d_u1f91f from "./dars/rasm/u1f91f.webp";
import d_u1f9a9 from "./dars/rasm/u1f9a9.webp";
import d_zinapoya from "./dars/rasm/zinapoya.webp";
import d_favourite_green from "./dars/rasm/favourite-green.webp";
import d_have_pet from "./dars/rasm/have-pet.webp";
import d_hi from "./dars/rasm/hi.webp";
import d_how_old from "./dars/rasm/how-old.webp";
import d_like_football from "./dars/rasm/like-football.webp";
import d_live_samarkand from "./dars/rasm/live-samarkand.webp";
import d_see_you_soon from "./dars/rasm/see-you-soon.webp";
import d_this_is_me from "./dars/rasm/this-is-me.webp";
import d_yellow from "./dars/rasm/yellow.webp";
import d_belgi from "./dars/rasm/belgi.webp";
import d_eslab_qol from "./dars/rasm/eslab-qol.webp";
import d_har_safar_ikkitaga_ko_payadi from "./dars/rasm/har-safar-ikkitaga-ko-payadi.webp";
import d_natijasi from "./dars/rasm/natijasi.webp";
import d_navbat from "./dars/rasm/navbat.webp";
import d_sabab from "./dars/rasm/sabab.webp";
import d_tashqarida from "./dars/rasm/tashqarida.webp";
import d_tunda from "./dars/rasm/tunda.webp";
import d_uy_hayvoni from "./dars/rasm/uy-hayvoni.webp";
import d_uyning_ichida from "./dars/rasm/uyning-ichida.webp";
import d_ali_and_i_made_it from "./dars/rasm/ali-and-i-made-it.webp";
import d_goal_hooray_well_done from "./dars/rasm/goal-hooray-well-done.webp";
import d_here_is_the_money_thank from "./dars/rasm/here-is-the-money-thank.webp";
import d_here_is_your_medicine_drink from "./dars/rasm/here-is-your-medicine-drink.webp";
import d_hi_can_you_play_football from "./dars/rasm/hi-can-you-play-football.webp";
import d_i_like_football_my_favourite from "./dars/rasm/i-like-football-my-favourite.webp";
import d_oh_no_my_shoe_can from "./dars/rasm/oh-no-my-shoe-can.webp";
import d_the_zoo_is_next_to from "./dars/rasm/the-zoo-is-next-to.webp";
import d_three_stops_here_is_the from "./dars/rasm/three-stops-here-is-the.webp";
import d_and_eat_fruit_get_well from "./dars/rasm/and-eat-fruit-get-well.webp";
import d_baliq_va_dengiz from "./dars/rasm/baliq-va-dengiz.webp";
import d_har_xil from "./dars/rasm/har-xil.webp";
import d_i_m_ready_i_go from "./dars/rasm/i-m-ready-i-go.webp";
import d_i_visited_my_granny_we from "./dars/rasm/i-visited-my-granny-we.webp";
import d_qisqa from "./dars/rasm/qisqa.webp";
import d_savatdan_tashqarida from "./dars/rasm/savatdan-tashqarida.webp";
import d_thank_you_very_much_goodbye from "./dars/rasm/thank-you-very-much-goodbye.webp";
import d_turn_left_at_the_bakery from "./dars/rasm/turn-left-at-the-bakery.webp";
import d_umumiy_belgi from "./dars/rasm/umumiy-belgi.webp";
import d_behind from "./dars/rasm/behind.webp";
import d_i_go_to_school from "./dars/rasm/i-go-to-school.webp";
import d_in_front_of from "./dars/rasm/in-front-of.webp";
import d_next_to from "./dars/rasm/next-to.webp";
import d_she_is_kind from "./dars/rasm/she-is-kind.webp";
import d_she_is_lazy from "./dars/rasm/she-is-lazy.webp";
import d_the_birds_are_singing from "./dars/rasm/the-birds-are-singing.webp";
import d_the_dog_is_running from "./dars/rasm/the-dog-is-running.webp";
import d_what_time_is_it from "./dars/rasm/what-time-is-it.webp";
import d_angry_child from "./dars/rasm/angry-child.webp";
import d_baby_chick_front_view from "./dars/rasm/baby-chick-front-view.webp";
import d_bar_of_soap_with from "./dars/rasm/bar-of-soap-with.webp";
import d_blue_square_shape from "./dars/rasm/blue-square-shape.webp";
import d_bowl_of_vegetable_salad from "./dars/rasm/bowl-of-vegetable-salad.webp";
import d_bowl_with_spoon from "./dars/rasm/bowl-with-spoon.webp";
import d_boy_raising_hand_my from "./dars/rasm/boy-raising-hand-my.webp";
import d_bus_stop from "./dars/rasm/bus-stop.webp";
import d_calendar from "./dars/rasm/calendar.webp";
import d_chestnut_seed from "./dars/rasm/chestnut-seed.webp";
import d_child_bowing_to_say from "./dars/rasm/child-bowing-to-say.webp";
import d_child_calling_for_help from "./dars/rasm/child-calling-for-help.webp";
import d_child_crossing_arms_saying from "./dars/rasm/child-crossing-arms-saying.webp";
import d_child_with_headache_bandage from "./dars/rasm/child-with-headache-bandage.webp";
import d_child_with_stomachache from "./dars/rasm/child-with-stomachache.webp";
import d_city_skyline_tashkent from "./dars/rasm/city-skyline-tashkent.webp";
import d_clock_showing_half_past from "./dars/rasm/clock-showing-half-past.webp";
import d_clock_showing_seven_o from "./dars/rasm/clock-showing-seven-o.webp";
import d_daisy_flower from "./dars/rasm/daisy-flower.webp";
import d_family_b from "./dars/rasm/family-b.webp";
import d_fork_and_knife from "./dars/rasm/fork-and-knife.webp";
import d_get_well_soon_card from "./dars/rasm/get-well-soon-card.webp";
import d_honeybee from "./dars/rasm/honeybee.webp";
import d_ice_cube from "./dars/rasm/ice-cube.webp";
import d_ladybug from "./dars/rasm/ladybug.webp";
import d_medicine_pills from "./dars/rasm/medicine-pills.webp";
import d_number_ten from "./dars/rasm/number-ten.webp";
import d_nurse from "./dars/rasm/nurse.webp";
import d_orange_color_circle from "./dars/rasm/orange-color-circle.webp";
import d_party_celebration_with_confetti from "./dars/rasm/party-celebration-with-confetti.webp";
import d_pear from "./dars/rasm/pear.webp";
import d_pedestrian_crossing_with_children from "./dars/rasm/pedestrian-crossing-with-children.webp";
import d_pine_forest from "./dars/rasm/pine-forest.webp";
import d_red_triangle_shape from "./dars/rasm/red-triangle-shape.webp";
import d_sad_child_saying_sorry from "./dars/rasm/sad-child-saying-sorry.webp";
import d_sea_waves from "./dars/rasm/sea-waves.webp";
import d_sick_child_with_thermometer from "./dars/rasm/sick-child-with-thermometer.webp";
import d_sleeping_child_in_bed from "./dars/rasm/sleeping-child-in-bed.webp";
import d_small_sprout from "./dars/rasm/small-sprout.webp";
import d_spoon from "./dars/rasm/spoon.webp";
import d_stack_of_books_library from "./dars/rasm/stack-of-books-library.webp";
import d_teapot from "./dars/rasm/teapot.webp";
import d_tear_off_calendar from "./dars/rasm/tear-off-calendar.webp";
import d_thermometer from "./dars/rasm/thermometer.webp";
import d_toothbrush_with_toothpaste from "./dars/rasm/toothbrush-with-toothpaste.webp";
import d_turnip_with_green_leaves from "./dars/rasm/turnip-with-green-leaves.webp";
import d_two_friends_holding_hands from "./dars/rasm/two-friends-holding-hands.webp";
import d_uzbek_flatbread_bakery from "./dars/rasm/uzbek-flatbread-bakery.webp";
import d_watermelon from "./dars/rasm/watermelon.webp";
import d_wrist_watch from "./dars/rasm/wrist-watch.webp";
import d_ant from "./dars/rasm/ant.webp";
import d_baby_chick_side_view from "./dars/rasm/baby-chick-side-view.webp";
import d_bactrian_camel from "./dars/rasm/bactrian-camel.webp";
import d_balance_scales from "./dars/rasm/balance-scales.webp";
import d_bone from "./dars/rasm/bone.webp";
import d_brain from "./dars/rasm/brain.webp";
import d_brown_soil from "./dars/rasm/brown-soil.webp";
import d_butterfly from "./dars/rasm/butterfly.webp";
import d_campfire from "./dars/rasm/campfire.webp";
import d_caterpillar from "./dars/rasm/caterpillar.webp";
import d_cherries from "./dars/rasm/cherries.webp";
import d_clock_showing_eight_o from "./dars/rasm/clock-showing-eight-o.webp";
import d_clock_showing_twelve_o from "./dars/rasm/clock-showing-twelve-o.webp";
import d_cup_of_hot_tea from "./dars/rasm/cup-of-hot-tea.webp";
import d_desert_with_dunes from "./dars/rasm/desert-with-dunes.webp";
import d_diploma_scroll from "./dars/rasm/diploma-scroll.webp";
import d_dolphin from "./dars/rasm/dolphin.webp";
import d_doughnut from "./dars/rasm/doughnut.webp";
import d_factory_with_smoke from "./dars/rasm/factory-with-smoke.webp";
import d_feather from "./dars/rasm/feather.webp";
import d_goat from "./dars/rasm/goat.webp";
import d_graduation_cap from "./dars/rasm/graduation-cap.webp";
import d_green_herb_plant from "./dars/rasm/green-herb-plant.webp";
import d_green_leaf from "./dars/rasm/green-leaf.webp";
import d_happy_child_with_party from "./dars/rasm/happy-child-with-party.webp";
import d_kneeling_child from "./dars/rasm/kneeling-child.webp";
import d_knife_cutting from "./dars/rasm/knife-cutting.webp";
import d_map from "./dars/rasm/map.webp";
import d_mobile_phone from "./dars/rasm/mobile-phone.webp";
import d_monkey_covering_eyes from "./dars/rasm/monkey-covering-eyes.webp";
import d_net_spider_web from "./dars/rasm/net-spider-web.webp";
import d_notebook from "./dars/rasm/notebook.webp";
import d_octopus from "./dars/rasm/octopus.webp";
import d_onion from "./dars/rasm/onion.webp";
import d_potted_plant from "./dars/rasm/potted-plant.webp";
import d_red_square_shape from "./dars/rasm/red-square-shape.webp";
import d_river_landscape from "./dars/rasm/river-landscape.webp";
import d_rock_stone from "./dars/rasm/rock-stone.webp";
import d_rocket from "./dars/rasm/rocket.webp";
import d_snowy_mountains from "./dars/rasm/snowy-mountains.webp";
import d_steam_rising from "./dars/rasm/steam-rising.webp";
import d_stethoscope from "./dars/rasm/stethoscope.webp";
import d_sun_hat from "./dars/rasm/sun-hat.webp";
import d_sunflower from "./dars/rasm/sunflower.webp";
import d_tooth from "./dars/rasm/tooth.webp";
import d_turtle from "./dars/rasm/turtle.webp";
import d_water_splash_puddle from "./dars/rasm/water-splash-puddle.webp";
import d_water_tap_with_drinking from "./dars/rasm/water-tap-with-drinking.webp";
import d_wheat_ears from "./dars/rasm/wheat-ears.webp";
import d_yawning_lazy_child_on from "./dars/rasm/yawning-lazy-child-on.webp";
import d_artist_with_palette from "./dars/rasm/artist-with-palette.webp";
import d_autumn_leaf from "./dars/rasm/autumn-leaf.webp";
import d_beating_heart from "./dars/rasm/beating-heart.webp";
import d_blue_book from "./dars/rasm/blue-book.webp";
import d_chick_hatching_from_egg from "./dars/rasm/chick-hatching-from-egg.webp";
import d_city_at_dusk from "./dars/rasm/city-at-dusk.webp";
import d_clock_face from "./dars/rasm/clock-face.webp";
import d_down_triangle from "./dars/rasm/down-triangle.webp";
import d_electric_plug from "./dars/rasm/electric-plug.webp";
import d_glass_bottle from "./dars/rasm/glass-bottle.webp";
import d_glass_jar from "./dars/rasm/glass-jar.webp";
import d_green_square from "./dars/rasm/green-square.webp";
import d_growth_chart from "./dars/rasm/growth-chart.webp";
import d_half_moon from "./dars/rasm/half-moon.webp";
import d_hedgehog from "./dars/rasm/hedgehog.webp";
import d_honey_pot from "./dars/rasm/honey-pot.webp";
import d_khiva_fortress from "./dars/rasm/khiva-fortress.webp";
import d_lollipop from "./dars/rasm/lollipop.webp";
import d_london_bridge from "./dars/rasm/london-bridge.webp";
import d_lungs from "./dars/rasm/lungs.webp";
import d_neighborhood_houses from "./dars/rasm/neighborhood-houses.webp";
import d_newspaper from "./dars/rasm/newspaper.webp";
import d_night_sky_over_houses from "./dars/rasm/night-sky-over-houses.webp";
import d_oval_ball from "./dars/rasm/oval-ball.webp";
import d_paw_prints from "./dars/rasm/paw-prints.webp";
import d_playground_slide from "./dars/rasm/playground-slide.webp";
import d_railway_track from "./dars/rasm/railway-track.webp";
import d_ribbon_bow from "./dars/rasm/ribbon-bow.webp";
import d_rooster from "./dars/rasm/rooster.webp";
import d_sheet_of_paper from "./dars/rasm/sheet-of-paper.webp";
import d_shopping_list from "./dars/rasm/shopping-list.webp";
import d_shower from "./dars/rasm/shower.webp";
import d_sled from "./dars/rasm/sled.webp";
import d_snowman from "./dars/rasm/snowman.webp";
import d_spinning_swirl from "./dars/rasm/spinning-swirl.webp";
import d_squirrel from "./dars/rasm/squirrel.webp";
import d_stopwatch from "./dars/rasm/stopwatch.webp";
import d_sun_behind_cloud from "./dars/rasm/sun-behind-cloud.webp";
import d_telephone_receiver from "./dars/rasm/telephone-receiver.webp";
import d_telescope from "./dars/rasm/telescope.webp";
import d_tent from "./dars/rasm/tent.webp";
import d_tin_can_cylinder from "./dars/rasm/tin-can-cylinder.webp";
import d_triangle_ruler from "./dars/rasm/triangle-ruler.webp";
import d_waffle from "./dars/rasm/waffle.webp";
import d_white_square from "./dars/rasm/white-square.webp";
import d_wilted_flower from "./dars/rasm/wilted-flower.webp";
import d_wind_gust from "./dars/rasm/wind-gust.webp";
import d_yellow_square from "./dars/rasm/yellow-square.webp";
import d_sahna_how_many_eggs from "./dars/rasm/sahna-how-many-eggs.webp";
import d_sahna_i_do_my_homework from "./dars/rasm/sahna-i-do-my-homework.webp";
import d_sahna_go_straight_then_turn from "./dars/rasm/sahna-go-straight-then-turn.webp";
import d_sahna_salom_doktor from "./dars/rasm/sahna-salom-doktor.webp";
export const DARS_RASM = {
  "d_apple-please": d_apple_please,
  "d_basket": d_basket,
  "d_bathroom": d_bathroom,
  "d_be-quiet": d_be_quiet,
  "d_bear": d_bear,
  "d_big": d_big,
  "d_black": d_black,
  "d_blue": d_blue,
  "d_brown": d_brown,
  "d_bu_mening_akam_yoki_ukam": d_bu_mening_akam_yoki_ukam,
  "d_bu_mening_dadam": d_bu_mening_dadam,
  "d_bu_mening_onam": d_bu_mening_onam,
  "d_bu_mening_opam_yoki_singlim": d_bu_mening_opam_yoki_singlim,
  "d_can-clap": d_can_clap,
  "d_can-i-help": d_can_i_help,
  "d_can-jump": d_can_jump,
  "d_can-you-swim": d_can_you_swim,
  "d_cant-fly": d_cant_fly,
  "d_clap-your-hands": d_clap_your_hands,
  "d_climb": d_climb,
  "d_close-book": d_close_book,
  "d_crocodile": d_crocodile,
  "d_dislike-onions": d_dislike_onions,
  "d_dislike-rain": d_dislike_rain,
  "d_dislike-spiders": d_dislike_spiders,
  "d_do-you-like": d_do_you_like,
  "d_do_st": d_do_st,
  "d_elephant": d_elephant,
  "d_family": d_family,
  "d_farm": d_farm,
  "d_favourite-colour": d_favourite_colour,
  "d_favourite-plov": d_favourite_plov,
  "d_fish-swim": d_fish_swim,
  "d_five-bananas": d_five_bananas,
  "d_fox": d_fox,
  "d_from-uzbekistan": d_from_uzbekistan,
  "d_futbolkam_qizil": d_futbolkam_qizil,
  "d_garden": d_garden,
  "d_giraffe": d_giraffe,
  "d_go-by-bus": d_go_by_bus,
  "d_goodbye-see-you": d_goodbye_see_you,
  "d_green": d_green,
  "d_grey": d_grey,
  "d_have-ball": d_have_ball,
  "d_have-cat": d_have_cat,
  "d_have-dog": d_have_dog,
  "d_have-sister": d_have_sister,
  "d_he-is-doctor": d_he_is_doctor,
  "d_hello": d_hello,
  "d_help-me": d_help_me,
  "d_here-you-are": d_here_you_are,
  "d_how-are-you": d_how_are_you,
  "d_how-go-school": d_how_go_school,
  "d_how-many": d_how_many,
  "d_how-many-bananas": d_how_many_bananas,
  "d_i-am-big": d_i_am_big,
  "d_i-am-five": d_i_am_five,
  "d_i-like": d_i_like,
  "d_i-walk": d_i_walk,
  "d_im-fine": d_im_fine,
  "d_im-thirsty": d_im_thirsty,
  "d_in-box": d_in_box,
  "d_its-a-ball": d_its_a_ball,
  "d_kitchen": d_kitchen,
  "d_kiy": d_kiy,
  "d_lets-count": d_lets_count,
  "d_lets-play": d_lets_play,
  "d_like-apples": d_like_apples,
  "d_like-cats": d_like_cats,
  "d_like-ice-cream": d_like_ice_cream,
  "d_lion": d_lion,
  "d_living-room": d_living_room,
  "d_love-mum": d_love_mum,
  "d_mening_ismim_anvar": d_mening_ismim_anvar,
  "d_money": d_money,
  "d_monkey": d_monkey,
  "d_my-name-is": d_my_name_is,
  "d_my-name-is_2": d_my_name_is_2,
  "d_nice-to-meet": d_nice_to_meet,
  "d_no": d_no,
  "d_no-i-cant": d_no_i_cant,
  "d_no-i-dont": d_no_i_dont,
  "d_of-course": d_of_course,
  "d_on-table": d_on_table,
  "d_open-book": d_open_book,
  "d_owl": d_owl,
  "d_pink": d_pink,
  "d_purple": d_purple,
  "d_raise-hand": d_raise_hand,
  "d_red": d_red,
  "d_ride-bike": d_ride_bike,
  "d_school": d_school,
  "d_shapkangni_kiy": d_shapkangni_kiy,
  "d_she-is-teacher": d_she_is_teacher,
  "d_sit-down": d_sit_down,
  "d_skate": d_skate,
  "d_small": d_small,
  "d_snake": d_snake,
  "d_snake-cant-walk": d_snake_cant_walk,
  "d_snowy": d_snowy,
  "d_stamp-your-feet": d_stamp_your_feet,
  "d_stand-up": d_stand_up,
  "d_stop": d_stop,
  "d_thank-you": d_thank_you,
  "d_this-is-my": d_this_is_my,
  "d_tiger": d_tiger,
  "d_today-is": d_today_is,
  "d_tomorrow": d_tomorrow,
  "d_tuflim_ko_k": d_tuflim_ko_k,
  "d_under-bed": d_under_bed,
  "d_want-pilot": d_want_pilot,
  "d_want-to-be": d_want_to_be,
  "d_weather": d_weather,
  "d_week": d_week,
  "d_weekend": d_weekend,
  "d_well-done": d_well_done,
  "d_what-day": d_what_day,
  "d_what-is-it": d_what_is_it,
  "d_what-like": d_what_like,
  "d_whats-your-name": d_whats_your_name,
  "d_where-cat": d_where_cat,
  "d_where-live": d_where_live,
  "d_white": d_white,
  "d_wolf": d_wolf,
  "d_xursand": d_xursand,
  "d_yes": d_yes,
  "d_yes-i-can": d_yes_i_can,
  "d_yes-i-do": d_yes_i_do,
  "d_yummy": d_yummy,
  "d_zebra": d_zebra,
  "d_chest": d_chest,
  "d_eat-fruit": d_eat_fruit,
  "d_i-go-to-bed": d_i_go_to_bed,
  "d_i-m-ready-for-school": d_i_m_ready_for_school,
  "d_i-visited-my-granny": d_i_visited_my_granny,
  "d_it-was-fun": d_it_was_fun,
  "d_look-left-and-right": d_look_left_and_right,
  "d_open-your-mouth": d_open_your_mouth,
  "d_sababi": d_sababi,
  "d_wash-your-hands-2": d_wash_your_hands_2,
  "d_astronavt": d_astronavt,
  "d_atirgul": d_atirgul,
  "d_axlat-qutisi": d_axlat_qutisi,
  "d_baliqcha": d_baliqcha,
  "d_behind-the-box": d_behind_the_box,
  "d_birinchi": d_birinchi,
  "d_bittani-ayirish": d_bittani_ayirish,
  "d_black-and-white": d_black_and_white,
  "d_burgut": d_burgut,
  "d_buxoro-bug-usi": d_buxoro_bug_usi,
  "d_buxoro": d_buxoro,
  "d_chigirtka": d_chigirtka,
  "d_chorak": d_chorak,
  "d_g-ildirak": d_g_ildirak,
  "d_go-sht": d_go_sht,
  "d_ikkinchi": d_ikkinchi,
  "d_ip-bilan-o-lchash": d_ip_bilan_o_lchash,
  "d_javob": d_javob,
  "d_kit-2": d_kit_2,
  "d_kit": d_kit,
  "d_kulrang-echkemar": d_kulrang_echkemar,
  "d_kurka": d_kurka,
  "d_magnit": d_magnit,
  "d_metroda": d_metroda,
  "d_mo-yqalam": d_mo_yqalam,
  "d_o-t-o-chirgich": d_o_t_o_chirgich,
  "d_og-ir": d_og_ir,
  "d_plastikni": d_plastikni,
  "d_qo-tos": d_qo_tos,
  "d_qor-qoploni": d_qor_qoploni,
  "d_qovun": d_qovun,
  "d_qushlarga-g-amxo-rlik": d_qushlarga_g_amxo_rlik,
  "d_quyosh-nuri-2": d_quyosh_nuri_2,
  "d_quyosh-nuri": d_quyosh_nuri,
  "d_rasmli-misol": d_rasmli_misol,
  "d_shaftoli": d_shaftoli,
  "d_soya": d_soya,
  "d_tik-va-qiya-nur": d_tik_va_qiya_nur,
  "d_til": d_til,
  "d_tortiladi": d_tortiladi,
  "d_tozalik": d_tozalik,
  "d_tuman": d_tuman,
  "d_uch": d_uch,
  "d_uchinchi": d_uchinchi,
  "d_urug-2": d_urug_2,
  "d_uya": d_uya,
  "d_yer-2": d_yer_2,
  "d_yer": d_yer,
  "d_yerning-qiyaligi": d_yerning_qiyaligi,
  "d_yuk-mashinasi": d_yuk_mashinasi,
  "d_101": d_101,
  "d_bir-soatda": d_bir_soatda,
  "d_bugun": d_bugun,
  "d_bulg-or-qalampiri": d_bulg_or_qalampiri,
  "d_cheksiz": d_cheksiz,
  "d_dumalaydigan-shakllar": d_dumalaydigan_shakllar,
  "d_elektr": d_elektr,
  "d_foydali-ovqat": d_foydali_ovqat,
  "d_grafik-diktant": d_grafik_diktant,
  "d_ikki-yuz-va-besh-yuz": d_ikki_yuz_va_besh_yuz,
  "d_istirohat-bog-i": d_istirohat_bog_i,
  "d_jun": d_jun,
  "d_ko-zoynak": d_ko_zoynak,
  "d_kompas": d_kompas,
  "d_kuzatish": d_kuzatish,
  "d_misoldan-masala": d_misoldan_masala,
  "d_momaqaldiroq": d_momaqaldiroq,
  "d_nafas-olish-va-chiqarish": d_nafas_olish_va_chiqarish,
  "d_narx": d_narx,
  "d_olti": d_olti,
  "d_oqqush": d_oqqush,
  "d_ovozini-baland-qilamiz": d_ovozini_baland_qilamiz,
  "d_oxirgi": d_oxirgi,
  "d_oy": d_oy,
  "d_oziq-zanjiri": d_oziq_zanjiri,
  "d_pashsha-va-mikroblar": d_pashsha_va_mikroblar,
  "d_pastda": d_pastda,
  "d_pingvin": d_pingvin,
  "d_qadam": d_qadam,
  "d_qator": d_qator,
  "d_qayta-foydalanish-2": d_qayta_foydalanish_2,
  "d_qayta-ishlash": d_qayta_ishlash,
  "d_qishki-uyqu": d_qishki_uyqu,
  "d_qo-shiq": d_qo_shiq,
  "d_qoldiq": d_qoldiq,
  "d_qon": d_qon,
  "d_qonuniyat": d_qonuniyat,
  "d_qulf": d_qulf,
  "d_qum-ostiga-yashirinadi": d_qum_ostiga_yashirinadi,
  "d_sarg-ayadi": d_sarg_ayadi,
  "d_sayyora": d_sayyora,
  "d_tajriba": d_tajriba,
  "d_temir-mixni": d_temir_mixni,
  "d_to-qqiz": d_to_qqiz,
  "d_yashil-rang": d_yashil_rang,
  "d_yeb-qo-ydi": d_yeb_qo_ydi,
  "d_yog-ochni": d_yog_ochni,
  "d_yulduzli-osmon": d_yulduzli_osmon,
  "d_yuz-so-mlik": d_yuz_so_mlik,
  "d_yuzlab-yil": d_yuzlab_yil,
  "d_cut": d_cut,
  "d_i-get-up": d_i_get_up,
  "d_i-went-to-the-park": d_i_went_to_the_park,
  "d_the-cat-is-sleeping": d_the_cat_is_sleeping,
  "d_what-did-you-do-yesterday": d_what_did_you_do_yesterday,
  "d_what-s-the-matter": d_what_s_the_matter,
  "d_where-is-the-park": d_where_is_the_park,
  "d_1": d_1,
  "d_2": d_2,
  "d_6": d_6,
  "d_7": d_7,
  "d_akula": d_akula,
  "d_bitta": d_bitta,
  "d_burger": d_burger,
  "d_diqqat": d_diqqat,
  "d_do-konga-boramiz": d_do_konga_boramiz,
  "d_dubulg-a": d_dubulg_a,
  "d_hayvonlar-ovqatsiz-qoladi": d_hayvonlar_ovqatsiz_qoladi,
  "d_hech-narsa-bo-lmaydi": d_hech_narsa_bo_lmaydi,
  "d_ildiz-chiriydi": d_ildiz_chiriydi,
  "d_juda-baland-ovozdan-saqlaymiz": d_juda_baland_ovozdan_saqlaymiz,
  "d_kalit": d_kalit,
  "d_kattalarni-chaqiramiz": d_kattalarni_chaqiramiz,
  "d_ko-p-chips": d_ko_p_chips,
  "d_ko-p-qavatli-uy": d_ko_p_qavatli_uy,
  "d_kunduzi": d_kunduzi,
  "d_mushtdek": d_mushtdek,
  "d_ovlaymiz": d_ovlaymiz,
  "d_qisqa-3": d_qisqa_3,
  "d_qo-rqitamiz": d_qo_rqitamiz,
  "d_quvurlar-orqali": d_quvurlar_orqali,
  "d_rasmga-olish": d_rasmga_olish,
  "d_samokat": d_samokat,
  "d_se": d_se,
  "d_sinadi-yoki-to-kiladi": d_sinadi_yoki_to_kiladi,
  "d_suv-qahramoni": d_suv_qahramoni,
  "d_suzdi": d_suzdi,
  "d_tepalik-ustida": d_tepalik_ustida,
  "d_to-kib-yuboramiz": d_to_kib_yuboramiz,
  "d_to-ntaramiz": d_to_ntaramiz,
  "d_tuk-tuk": d_tuk_tuk,
  "d_tuzdan": d_tuzdan,
  "d_u1f314": d_u1f314,
  "d_u1f376": d_u1f376,
  "d_u1f48e": d_u1f48e,
  "d_u1f54a": d_u1f54a,
  "d_u1f91f": d_u1f91f,
  "d_u1f9a9": d_u1f9a9,
  "d_zinapoya": d_zinapoya,
  "d_favourite-green": d_favourite_green,
  "d_have-pet": d_have_pet,
  "d_hi": d_hi,
  "d_how-old": d_how_old,
  "d_like-football": d_like_football,
  "d_live-samarkand": d_live_samarkand,
  "d_see-you-soon": d_see_you_soon,
  "d_this-is-me": d_this_is_me,
  "d_yellow": d_yellow,
  "d_belgi": d_belgi,
  "d_eslab-qol": d_eslab_qol,
  "d_har-safar-ikkitaga-ko-payadi": d_har_safar_ikkitaga_ko_payadi,
  "d_natijasi": d_natijasi,
  "d_navbat": d_navbat,
  "d_sabab": d_sabab,
  "d_tashqarida": d_tashqarida,
  "d_tunda": d_tunda,
  "d_uy-hayvoni": d_uy_hayvoni,
  "d_uyning-ichida": d_uyning_ichida,
  "d_ali-and-i-made-it": d_ali_and_i_made_it,
  "d_goal-hooray-well-done": d_goal_hooray_well_done,
  "d_here-is-the-money-thank": d_here_is_the_money_thank,
  "d_here-is-your-medicine-drink": d_here_is_your_medicine_drink,
  "d_hi-can-you-play-football": d_hi_can_you_play_football,
  "d_i-like-football-my-favourite": d_i_like_football_my_favourite,
  "d_oh-no-my-shoe-can": d_oh_no_my_shoe_can,
  "d_the-zoo-is-next-to": d_the_zoo_is_next_to,
  "d_three-stops-here-is-the": d_three_stops_here_is_the,
  "d_and-eat-fruit-get-well": d_and_eat_fruit_get_well,
  "d_baliq-va-dengiz": d_baliq_va_dengiz,
  "d_har-xil": d_har_xil,
  "d_i-m-ready-i-go": d_i_m_ready_i_go,
  "d_i-visited-my-granny-we": d_i_visited_my_granny_we,
  "d_qisqa": d_qisqa,
  "d_savatdan-tashqarida": d_savatdan_tashqarida,
  "d_thank-you-very-much-goodbye": d_thank_you_very_much_goodbye,
  "d_turn-left-at-the-bakery": d_turn_left_at_the_bakery,
  "d_umumiy-belgi": d_umumiy_belgi,
  "d_behind": d_behind,
  "d_i-go-to-school": d_i_go_to_school,
  "d_in-front-of": d_in_front_of,
  "d_next-to": d_next_to,
  "d_she-is-kind": d_she_is_kind,
  "d_she-is-lazy": d_she_is_lazy,
  "d_the-birds-are-singing": d_the_birds_are_singing,
  "d_the-dog-is-running": d_the_dog_is_running,
  "d_what-time-is-it": d_what_time_is_it,
  "d_angry-child": d_angry_child,
  "d_baby-chick-front-view": d_baby_chick_front_view,
  "d_bar-of-soap-with": d_bar_of_soap_with,
  "d_blue-square-shape": d_blue_square_shape,
  "d_bowl-of-vegetable-salad": d_bowl_of_vegetable_salad,
  "d_bowl-with-spoon": d_bowl_with_spoon,
  "d_boy-raising-hand-my": d_boy_raising_hand_my,
  "d_bus-stop": d_bus_stop,
  "d_calendar": d_calendar,
  "d_chestnut-seed": d_chestnut_seed,
  "d_child-bowing-to-say": d_child_bowing_to_say,
  "d_child-calling-for-help": d_child_calling_for_help,
  "d_child-crossing-arms-saying": d_child_crossing_arms_saying,
  "d_child-with-headache-bandage": d_child_with_headache_bandage,
  "d_child-with-stomachache": d_child_with_stomachache,
  "d_city-skyline-tashkent": d_city_skyline_tashkent,
  "d_clock-showing-half-past": d_clock_showing_half_past,
  "d_clock-showing-seven-o": d_clock_showing_seven_o,
  "d_daisy-flower": d_daisy_flower,
  "d_family-b": d_family_b,
  "d_fork-and-knife": d_fork_and_knife,
  "d_get-well-soon-card": d_get_well_soon_card,
  "d_honeybee": d_honeybee,
  "d_ice-cube": d_ice_cube,
  "d_ladybug": d_ladybug,
  "d_medicine-pills": d_medicine_pills,
  "d_number-ten": d_number_ten,
  "d_nurse": d_nurse,
  "d_orange-color-circle": d_orange_color_circle,
  "d_party-celebration-with-confetti": d_party_celebration_with_confetti,
  "d_pear": d_pear,
  "d_pedestrian-crossing-with-children": d_pedestrian_crossing_with_children,
  "d_pine-forest": d_pine_forest,
  "d_red-triangle-shape": d_red_triangle_shape,
  "d_sad-child-saying-sorry": d_sad_child_saying_sorry,
  "d_sea-waves": d_sea_waves,
  "d_sick-child-with-thermometer": d_sick_child_with_thermometer,
  "d_sleeping-child-in-bed": d_sleeping_child_in_bed,
  "d_small-sprout": d_small_sprout,
  "d_spoon": d_spoon,
  "d_stack-of-books-library": d_stack_of_books_library,
  "d_teapot": d_teapot,
  "d_tear-off-calendar": d_tear_off_calendar,
  "d_thermometer": d_thermometer,
  "d_toothbrush-with-toothpaste": d_toothbrush_with_toothpaste,
  "d_turnip-with-green-leaves": d_turnip_with_green_leaves,
  "d_two-friends-holding-hands": d_two_friends_holding_hands,
  "d_uzbek-flatbread-bakery": d_uzbek_flatbread_bakery,
  "d_watermelon": d_watermelon,
  "d_wrist-watch": d_wrist_watch,
  "d_ant": d_ant,
  "d_baby-chick-side-view": d_baby_chick_side_view,
  "d_bactrian-camel": d_bactrian_camel,
  "d_balance-scales": d_balance_scales,
  "d_bone": d_bone,
  "d_brain": d_brain,
  "d_brown-soil": d_brown_soil,
  "d_butterfly": d_butterfly,
  "d_campfire": d_campfire,
  "d_caterpillar": d_caterpillar,
  "d_cherries": d_cherries,
  "d_clock-showing-eight-o": d_clock_showing_eight_o,
  "d_clock-showing-twelve-o": d_clock_showing_twelve_o,
  "d_cup-of-hot-tea": d_cup_of_hot_tea,
  "d_desert-with-dunes": d_desert_with_dunes,
  "d_diploma-scroll": d_diploma_scroll,
  "d_dolphin": d_dolphin,
  "d_doughnut": d_doughnut,
  "d_factory-with-smoke": d_factory_with_smoke,
  "d_feather": d_feather,
  "d_goat": d_goat,
  "d_graduation-cap": d_graduation_cap,
  "d_green-herb-plant": d_green_herb_plant,
  "d_green-leaf": d_green_leaf,
  "d_happy-child-with-party": d_happy_child_with_party,
  "d_kneeling-child": d_kneeling_child,
  "d_knife-cutting": d_knife_cutting,
  "d_map": d_map,
  "d_mobile-phone": d_mobile_phone,
  "d_monkey-covering-eyes": d_monkey_covering_eyes,
  "d_net-spider-web": d_net_spider_web,
  "d_notebook": d_notebook,
  "d_octopus": d_octopus,
  "d_onion": d_onion,
  "d_potted-plant": d_potted_plant,
  "d_red-square-shape": d_red_square_shape,
  "d_river-landscape": d_river_landscape,
  "d_rock-stone": d_rock_stone,
  "d_rocket": d_rocket,
  "d_snowy-mountains": d_snowy_mountains,
  "d_steam-rising": d_steam_rising,
  "d_stethoscope": d_stethoscope,
  "d_sun-hat": d_sun_hat,
  "d_sunflower": d_sunflower,
  "d_tooth": d_tooth,
  "d_turtle": d_turtle,
  "d_water-splash-puddle": d_water_splash_puddle,
  "d_water-tap-with-drinking": d_water_tap_with_drinking,
  "d_wheat-ears": d_wheat_ears,
  "d_yawning-lazy-child-on": d_yawning_lazy_child_on,
  "d_artist-with-palette": d_artist_with_palette,
  "d_autumn-leaf": d_autumn_leaf,
  "d_beating-heart": d_beating_heart,
  "d_blue-book": d_blue_book,
  "d_chick-hatching-from-egg": d_chick_hatching_from_egg,
  "d_city-at-dusk": d_city_at_dusk,
  "d_clock-face": d_clock_face,
  "d_down-triangle": d_down_triangle,
  "d_electric-plug": d_electric_plug,
  "d_glass-bottle": d_glass_bottle,
  "d_glass-jar": d_glass_jar,
  "d_green-square": d_green_square,
  "d_growth-chart": d_growth_chart,
  "d_half-moon": d_half_moon,
  "d_hedgehog": d_hedgehog,
  "d_honey-pot": d_honey_pot,
  "d_khiva-fortress": d_khiva_fortress,
  "d_lollipop": d_lollipop,
  "d_london-bridge": d_london_bridge,
  "d_lungs": d_lungs,
  "d_neighborhood-houses": d_neighborhood_houses,
  "d_newspaper": d_newspaper,
  "d_night-sky-over-houses": d_night_sky_over_houses,
  "d_oval-ball": d_oval_ball,
  "d_paw-prints": d_paw_prints,
  "d_playground-slide": d_playground_slide,
  "d_railway-track": d_railway_track,
  "d_ribbon-bow": d_ribbon_bow,
  "d_rooster": d_rooster,
  "d_sheet-of-paper": d_sheet_of_paper,
  "d_shopping-list": d_shopping_list,
  "d_shower": d_shower,
  "d_sled": d_sled,
  "d_snowman": d_snowman,
  "d_spinning-swirl": d_spinning_swirl,
  "d_squirrel": d_squirrel,
  "d_stopwatch": d_stopwatch,
  "d_sun-behind-cloud": d_sun_behind_cloud,
  "d_telephone-receiver": d_telephone_receiver,
  "d_telescope": d_telescope,
  "d_tent": d_tent,
  "d_tin-can-cylinder": d_tin_can_cylinder,
  "d_triangle-ruler": d_triangle_ruler,
  "d_waffle": d_waffle,
  "d_white-square": d_white_square,
  "d_wilted-flower": d_wilted_flower,
  "d_wind-gust": d_wind_gust,
  "d_yellow-square": d_yellow_square,
  "d_sahna-how-many-eggs": d_sahna_how_many_eggs,
  "d_sahna-i-do-my-homework": d_sahna_i_do_my_homework,
  "d_sahna-go-straight-then-turn": d_sahna_go_straight_then_turn,
  "d_sahna-salom-doktor": d_sahna_salom_doktor,
};
/** Xonalar va darslar rasmlari birga — emoji/so'z bo'yicha topilgan id shu yerdan olinadi. */
// REV153: o'yinlar uchun chizilgan yulduz, quti, pufak — darsda ham (⭐ 📦 🫧)
export const JONLI_DARS = { j_yulduz: JR.yulduz, j_quti: JR.quti, j_pufak: JR.pufak };
export const RASM_HAMMA = { ...RASMLAR, ...DARS_RASM, ...JONLI_DARS };
